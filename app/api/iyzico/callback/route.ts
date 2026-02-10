import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutFormResult } from '@/lib/iyzico';
import { sendOrderEmails, type OrderEmailData } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper function to send order emails
async function sendOrderConfirmationEmails(orderId: string) {
  if (!supabase) return;

  try {
    // Fetch order with items in a single query (N+1 fix)
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

    // Prepare email data
    const emailData: OrderEmailData = {
      orderId: order.id,
      customerName: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Müşteri',
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: {
        address: order.shipping_address || '',
        city: order.shipping_city || '',
        district: order.shipping_district,
        zipCode: order.shipping_zip_code,
      },
      items: (order.items || []).map((item: any) => ({
        title: item.product_title || item.product_name || 'Ürün',
        quantity: item.quantity || 1,
        price: `${item.price || 0} TL`,
      })),
      subtotal: `${order.subtotal || order.total || 0} TL`,
      shippingCost: `${order.shipping_cost || 0} TL`,
      total: `${order.total || 0} TL`,
    };

    // Send emails
    await sendOrderEmails(emailData);
    console.log('Order confirmation emails sent for:', orderId);
  } catch (error) {
    console.error('Error sending order confirmation emails:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    // Get form data from iyzico callback
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
    }

    // Retrieve payment result from iyzico
    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // Payment successful
      const orderId = result.conversationId;
      const paymentId = result.paymentId;
      const paidPrice = result.paidPrice;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Update order in database
      if (supabase && orderId && uuidRegex.test(orderId)) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'processing',
              payment_status: 'paid',
              payment_id: paymentId,
              payment_method: 'credit_card',
              paid_amount: parseFloat(paidPrice),
              paid_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          // Send order confirmation emails (don't await to not block redirect)
          sendOrderConfirmationEmails(orderId).catch(console.error);
        } catch (dbError) {
          console.error('Database update error:', dbError);
        }
      }

      // Redirect to success page
      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId);
      successUrl.searchParams.set('paymentId', paymentId);
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed
      const errorMessage = result.errorMessage || 'Ödeme işlemi başarısız';
      const errorCode = result.errorCode || 'unknown';
      const orderId = result.conversationId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Update order status to failed
      if (supabase && orderId && uuidRegex.test(orderId)) {
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

      // Redirect to error page
      const errorUrl = new URL('/odeme-hatasi', request.url);
      errorUrl.searchParams.set('error', errorCode);
      errorUrl.searchParams.set('message', encodeURIComponent(errorMessage));
      if (orderId) {
        errorUrl.searchParams.set('orderId', orderId);
      }
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('iyzico callback error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}

// Also handle GET requests (some payment gateways use GET for callbacks)
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'auth');
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
  }

  // Process the same way as POST
  try {
    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      const orderId = result.conversationId;
      const paymentId = result.paymentId;
      const paidPrice = result.paidPrice;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Update order if supabase is available
      if (supabase && orderId && uuidRegex.test(orderId)) {
        await supabase
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'paid',
            payment_id: paymentId,
            paid_amount: parseFloat(paidPrice),
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        // Send order confirmation emails
        sendOrderConfirmationEmails(orderId).catch(console.error);
      }

      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId);
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/odeme-hatasi', request.url);
      errorUrl.searchParams.set('error', result.errorCode || 'payment_failed');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('iyzico callback GET error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}
