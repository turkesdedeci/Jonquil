import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getAllProductsServer } from '@/lib/products-server';
import { sendOrderEmails } from '@/lib/resend';
import {
  checkRateLimitAsync,
  getClientIP,
  requireSameOrigin,
  sanitizeString,
  escapeHtml,
  safeErrorResponse,
  handleDatabaseError,
  checkGuestEmailRateLimit,
} from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Service role key required — anon key cannot insert orders due to RLS
const serverSupabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Generate cryptographically secure order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JQ${timestamp}${random}`;
}

function buildDbErrorText(error: any): string {
  return `${error?.code || ''} ${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
}

function needsGuestLegacyFallback(error: any): boolean {
  if (!error) return false;
  const text = buildDbErrorText(error);

  // Legacy schemas may still require these columns for guest orders.
  return (
    text.includes('user_id') ||
    text.includes('shipping_address_id') ||
    text.includes('null value in column')
  );
}

// GET - KullanÄ±cÄ±nÄ±n sipariÅŸlerini getir
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'GiriÅŸ gerekli' }, { status: 401 });
    }

    if (!serverSupabase) {
      return NextResponse.json(
        { error: 'Supabase baÄŸlantÄ± bilgileri eksik' },
        { status: 500 }
      );
    }

    // SipariÅŸleri ve Ã¼rÃ¼nleri tek sorguda getir (N+1 query fix)
    const { data: orders, error: ordersError } = await serverSupabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return handleDatabaseError(ordersError);
    }

    return NextResponse.json(orders || [], {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'SipariÅŸler yÃ¼klenemedi');
  }
}

// POST - Yeni sipariÅŸ oluÅŸtur
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - write operations
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    const { userId } = await auth();
    const clerkUser = userId ? await currentUser() : null;

    if (!serverSupabase) {
      return NextResponse.json(
        { error: 'Supabase baÄŸlantÄ± bilgileri eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      shipping_address_id,
      payment_method,
      order_note,
      items,
      customer,
      shipping_address,
    } = body;

    // Sanitize order note
    const sanitizedOrderNote = order_note ? sanitizeString(order_note).slice(0, 1000) : null;

    // Validation
    if ((!shipping_address_id && !shipping_address) || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Eksik bilgi: Adres ve Ã¼rÃ¼n gerekli' },
        { status: 400 }
      );
    }

    // Input length validation to prevent DoS
    if (items.length > 50) {
      return NextResponse.json(
        { error: 'Ã‡ok fazla Ã¼rÃ¼n (maksimum 50)' },
        { status: 400 }
      );
    }

    // Validate per-item quantity to prevent inventory manipulation
    const MAX_ITEM_QUANTITY = 99;
    for (const item of items) {
      const qty = parseInt(item.quantity) || 1;
      if (qty < 1 || qty > MAX_ITEM_QUANTITY) {
        return NextResponse.json(
          { error: `Gecersiz miktar: Her urunden en fazla ${MAX_ITEM_QUANTITY} adet siparis verilebilir` },
          { status: 400 }
        );
      }
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'bank'];
    if (payment_method && !validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        { error: 'GeÃ§ersiz Ã¶deme yÃ¶ntemi' },
        { status: 400 }
      );
    }

    // For guest checkout, require customer basics
    if (!userId) {
      if (!customer?.first_name || !customer?.last_name || !customer?.email || !customer?.phone) {
        return NextResponse.json({ error: 'Misafir bilgileri gerekli' }, { status: 400 });
      }
      if (!shipping_address?.address_line || !shipping_address?.city) {
        return NextResponse.json({ error: 'Misafir adres bilgileri gerekli' }, { status: 400 });
      }
      // Rate limit guest orders per email to prevent spam & inventory attacks
      const emailRateLimit = checkGuestEmailRateLimit(customer.email);
      if (emailRateLimit) return emailRateLimit;
    }

    // Fetch address for logged-in users
    let address: any = null;
    if (userId && shipping_address_id) {
      const { data: addr, error: addressError } = await serverSupabase
        .from('addresses')
        .select('*')
        .eq('id', shipping_address_id)
        .eq('user_id', userId)
        .single();

      if (addressError || !addr) {
        return NextResponse.json({ error: 'Adres bulunamadÄ±' }, { status: 404 });
      }
      address = addr;
    }

    // Build lookup for server-side validation
    const allProducts = await getAllProductsServer();
    const productById = new Map(allProducts.map(p => [p.id, p]));

    // Check stock status for all items
    const productIds = items.map((item: any) => item.product_id);
    const { data: stockData } = await serverSupabase
      .from('product_stock')
      .select('product_id, in_stock')
      .in('product_id', productIds);

    // Create stock lookup map (default to in stock if not in table)
    const stockStatus: Record<string, boolean> = {};
    stockData?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
    });

    // Check if any item is out of stock
    const outOfStockItems = items.filter((item: any) => {
      const stockTableStatus = stockStatus[item.product_id];
      const product = productById.get(item.product_id);
      const productInStock = product ? product.inStock !== false : true;
      return stockTableStatus === false || !productInStock;
    });

    if (outOfStockItems.length > 0) {
      const outOfStockNames = outOfStockItems.map((item: any) => item.product_title).join(', ');
      return NextResponse.json(
        { error: `Stokta olmayan Ã¼rÃ¼nler: ${outOfStockNames}` },
        { status: 400 }
      );
    }

    // Server-side price validation
    let serverSubtotal = 0;
    type NormalizedOrderItem = {
      product_id: string;
      product_title: string;
      product_subtitle: string | null;
      product_image: string | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    };

    const normalizedItems: NormalizedOrderItem[] = items.map((item: any): NormalizedOrderItem => {
      const product = productById.get(item.product_id);
      if (!product) {
        throw new Error(`ÃœrÃ¼n bulunamadÄ±: ${item.product_id}`);
      }
      const quantity = parseInt(item.quantity) || 1;
      const priceMatch = product.price.match(/[\d.]+/);
      const unitPrice = priceMatch ? parseFloat(priceMatch[0]) : 0;
      const totalPrice = unitPrice * quantity;
      serverSubtotal += totalPrice;
      return {
        product_id: product.id,
        product_title: product.title,
        product_subtitle: product.subtitle,
        product_image: product.images?.[0] || null,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const shippingCost = serverSubtotal >= 500 ? 0 : 49.9;
    const totalAmount = serverSubtotal + shippingCost;

    // Generate cryptographically secure order number
    const orderNumber = generateOrderNumber();
    const orderInsertPayload = {
      ...(userId ? { user_id: userId, shipping_address_id } : {}),
      order_number: orderNumber,
      status: payment_method === 'bank' ? 'pending' : 'processing',
      subtotal: serverSubtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      order_note: sanitizedOrderNote,
      customer_first_name: sanitizeString(customer?.first_name || address?.full_name?.split(' ')[0] || '').slice(0, 100),
      customer_last_name: sanitizeString(customer?.last_name || address?.full_name?.split(' ').slice(1).join(' ') || '').slice(0, 100),
      customer_email: sanitizeString(customer?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '').slice(0, 255),
      customer_phone: sanitizeString(customer?.phone || address?.phone || '').slice(0, 30),
      shipping_address: userId ? address?.address_line : sanitizeString(shipping_address?.address_line || '').slice(0, 500),
      shipping_city: userId ? address?.city : sanitizeString(shipping_address?.city || '').slice(0, 100),
      shipping_district: userId ? address?.district : sanitizeString(shipping_address?.district || '').slice(0, 100),
      shipping_zip_code: userId ? address?.postal_code : sanitizeString(shipping_address?.postal_code || '').slice(0, 10),
    };

    // Create order
    let { data: order, error: orderError } = await serverSupabase
      .from('orders')
      .insert(orderInsertPayload)
      .select()
      .single();

    // Backward-compatibility fallback for legacy schemas:
    // some databases still require user_id/shipping_address_id for guest orders.
    if (orderError && !userId && needsGuestLegacyFallback(orderError)) {
      // Use a random UUID instead of predictable guest_<orderNumber> to prevent enumeration
      const legacyGuestUserId = `guest_${crypto.randomUUID()}`;
      const legacyFullName = `${orderInsertPayload.customer_first_name || ''} ${orderInsertPayload.customer_last_name || ''}`.trim() || 'Misafir Kullanici';

      const { data: guestAddress, error: guestAddressError } = await serverSupabase
        .from('addresses')
        .insert({
          user_id: legacyGuestUserId,
          title: 'Misafir Adresi',
          full_name: legacyFullName,
          phone: orderInsertPayload.customer_phone || '',
          address_line: orderInsertPayload.shipping_address || '',
          district: orderInsertPayload.shipping_district || '',
          city: orderInsertPayload.shipping_city || '',
          postal_code: orderInsertPayload.shipping_zip_code || '',
          is_default: false,
        })
        .select('id')
        .single();

      if (!guestAddressError && guestAddress?.id) {
        // Use explicit fields instead of spread to avoid sending unexpected columns
        const legacyInsert = await serverSupabase
          .from('orders')
          .insert({
            user_id: legacyGuestUserId,
            shipping_address_id: guestAddress.id,
            order_number: orderInsertPayload.order_number,
            status: orderInsertPayload.status,
            subtotal: orderInsertPayload.subtotal,
            shipping_cost: orderInsertPayload.shipping_cost,
            total_amount: orderInsertPayload.total_amount,
            order_note: orderInsertPayload.order_note,
            customer_first_name: orderInsertPayload.customer_first_name,
            customer_last_name: orderInsertPayload.customer_last_name,
            customer_email: orderInsertPayload.customer_email,
            customer_phone: orderInsertPayload.customer_phone,
            shipping_address: orderInsertPayload.shipping_address,
            shipping_city: orderInsertPayload.shipping_city,
            shipping_district: orderInsertPayload.shipping_district,
            shipping_zip_code: orderInsertPayload.shipping_zip_code,
          })
          .select()
          .single();

        order = legacyInsert.data;
        orderError = legacyInsert.error;
      } else {
        console.error('[Orders] Guest fallback address create error:', JSON.stringify(guestAddressError, null, 2));
      }
    }

    if (orderError || !order) {
      console.error('[Orders] Create order error:', JSON.stringify(orderError, null, 2));
      return handleDatabaseError(orderError);
    }

    // Create order items
    const orderItems = normalizedItems.map((item: NormalizedOrderItem) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await serverSupabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[Orders] Create order items error:', JSON.stringify(itemsError, null, 2));
      return handleDatabaseError(itemsError);
    }

    // Fetch complete order with items
    const { data: completeOrder } = await serverSupabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    if (payment_method === 'bank') {
      try {
        const formatPrice = (value: number) => `${value.toLocaleString('tr-TR')} â‚º`;
        await sendOrderEmails({
          orderId: order.order_number || order.id,
          customerName: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
          customerEmail: order.customer_email || '',
          customerPhone: order.customer_phone || undefined,
          shippingAddress: {
            address: order.shipping_address || '',
            city: order.shipping_city || '',
            district: order.shipping_district || undefined,
            zipCode: order.shipping_zip_code || undefined,
          },
          items: normalizedItems.map(item => ({
            title: item.product_title,
            quantity: item.quantity,
            price: formatPrice(item.total_price),
          })),
          subtotal: formatPrice(serverSubtotal),
          shippingCost: formatPrice(shippingCost),
          total: formatPrice(totalAmount),
        });
      } catch (error) {
        console.error('Failed to send bank order emails:', error);
      }
    }

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    return safeErrorResponse(error, 'SipariÅŸ oluÅŸturulamadÄ±');
  }
}

// PATCH - SipariÅŸ durumunu gÃ¼ncelle (kullanÄ±cÄ± sadece iptal edebilir)
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'GiriÅŸ yapmanÄ±z gerekiyor' }, { status: 401 });
    }

    if (!serverSupabase) {
      return NextResponse.json(
        { error: 'Supabase baÄŸlantÄ± bilgileri eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'order_id ve status gerekli' },
        { status: 400 }
      );
    }

    // Users can only cancel orders (not change to other statuses)
    if (status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Bu iÅŸlem iÃ§in yetkiniz yok' },
        { status: 403 }
      );
    }

    // Check if order is in a cancellable state
    const { data: existingOrder } = await serverSupabase
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: 'SipariÅŸ bulunamadÄ±' }, { status: 404 });
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: 'Bu sipariÅŸ artÄ±k iptal edilemez' },
        { status: 400 }
      );
    }

    // Update order status
    const { data, error } = await serverSupabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error, 'SipariÅŸ gÃ¼ncellenemedi');
  }
}


