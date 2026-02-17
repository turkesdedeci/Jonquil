import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutFormResult } from '@/lib/iyzico';
import { sendOrderEmails, type OrderEmailData } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const ORDER_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string | null | undefined): value is string {
  return !!value && ORDER_ID_REGEX.test(value);
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function formatTryCurrency(value: unknown): string {
  const amount = toFiniteNumber(value, 0);
  return `${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

async function sendOrderConfirmationEmails(orderId: string) {
  if (!supabase || !isUuid(orderId)) return;

  try {
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (!order) {
      console.error('Order not found for email:', orderId);
      return;
    }

    const emailData: OrderEmailData = {
      orderId: order.order_number || order.id,
      customerName: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Musteri',
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: {
        address: order.shipping_address || '',
        city: order.shipping_city || '',
        district: order.shipping_district,
        zipCode: order.shipping_zip_code,
      },
      items: (order.items || []).map((item: Record<string, unknown>) => {
        const quantity = toFiniteNumber(item.quantity, 1);
        const unitPrice = toFiniteNumber(item.unit_price, toFiniteNumber(item.price, 0));
        const lineTotal = toFiniteNumber(item.total_price, unitPrice * quantity);

        return {
          title: String(item.product_title || item.product_name || 'Urun'),
          quantity,
          price: formatTryCurrency(lineTotal),
        };
      }),
      subtotal: formatTryCurrency(order.subtotal),
      shippingCost: formatTryCurrency(order.shipping_cost),
      total: formatTryCurrency(order.total_amount ?? order.total),
    };

    await sendOrderEmails(emailData);
    console.log('Order confirmation emails sent for:', orderId);
  } catch (error) {
    console.error('Error sending order confirmation emails:', error);
  }
}

async function markOrderPaidIfNeeded(orderId: string, paymentId: string | null, paidPrice: string | null) {
  if (!supabase || !isUuid(orderId)) return;

  try {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('payment_status, payment_id')
      .eq('id', orderId)
      .single();

    const alreadyPaid =
      existingOrder?.payment_status === 'paid' ||
      (!!existingOrder?.payment_id && !!paymentId && existingOrder.payment_id === paymentId);

    if (alreadyPaid) {
      console.info('[iyzico callback] Order already paid, skipping update:', orderId);
      return;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        payment_status: 'paid',
        payment_id: paymentId,
        payment_method: 'credit_card',
        paid_amount: toFiniteNumber(paidPrice, 0),
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Database update error after successful payment:', updateError);
      return;
    }

    sendOrderConfirmationEmails(orderId).catch(console.error);
  } catch (dbError) {
    console.error('Database update error:', dbError);
  }
}

async function markOrderFailed(orderId: string | null, errorMessage: string) {
  if (!supabase || !isUuid(orderId)) return;

  try {
    await supabase
      .from('orders')
      .update({
        status: 'payment_failed',
        payment_status: 'failed',
        payment_error: errorMessage,
      })
      .eq('id', orderId);
  } catch (dbError) {
    console.error('Database update error:', dbError);
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
    }

    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      const orderId = result.conversationId;
      const paymentId = result.paymentId;
      const paidPrice = result.paidPrice;

      if (isUuid(orderId)) {
        await markOrderPaidIfNeeded(orderId, paymentId, paidPrice);
      }

      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId || '');
      successUrl.searchParams.set('paymentId', paymentId || '');
      return NextResponse.redirect(successUrl);
    }

    const errorMessage = result.errorMessage || 'Odeme islemi basarisiz';
    const errorCode = result.errorCode || 'unknown';
    const orderId = result.conversationId;

    await markOrderFailed(orderId, errorMessage);

    const errorUrl = new URL('/odeme-hatasi', request.url);
    errorUrl.searchParams.set('error', errorCode);
    errorUrl.searchParams.set('message', errorMessage);
    if (orderId) {
      errorUrl.searchParams.set('orderId', orderId);
    }
    return NextResponse.redirect(errorUrl);
  } catch (error) {
    console.error('iyzico callback error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'auth');
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
  }

  try {
    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      const orderId = result.conversationId;
      const paymentId = result.paymentId;
      const paidPrice = result.paidPrice;

      if (isUuid(orderId)) {
        await markOrderPaidIfNeeded(orderId, paymentId, paidPrice);
      }

      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId || '');
      if (paymentId) {
        successUrl.searchParams.set('paymentId', paymentId);
      }
      return NextResponse.redirect(successUrl);
    }

    const errorUrl = new URL('/odeme-hatasi', request.url);
    errorUrl.searchParams.set('error', result.errorCode || 'payment_failed');
    return NextResponse.redirect(errorUrl);
  } catch (error) {
    console.error('iyzico callback GET error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}
