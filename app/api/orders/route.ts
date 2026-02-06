import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import {
  checkRateLimit,
  getClientIP,
  sanitizeString,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';

// Generate cryptographically secure order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JQ${timestamp}${random}`;
}

// GET - Kullanıcının siparişlerini getir
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // Siparişleri ve ürünleri tek sorguda getir (N+1 query fix)
    const { data: orders, error: ordersError } = await supabase
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

    return NextResponse.json(orders || []);
  } catch (error) {
    return safeErrorResponse(error, 'Siparişler yüklenemedi');
  }
}

// POST - Yeni sipariş oluştur
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - write operations
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const {
      shipping_address_id,
      payment_method,
      order_note,
      items,
      subtotal,
      shipping_cost,
      total_amount,
    } = body;

    // Sanitize order note
    const sanitizedOrderNote = order_note ? sanitizeString(order_note).slice(0, 1000) : null;

    // Validation
    if (!shipping_address_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Eksik bilgi: Adres ve ürün gerekli' },
        { status: 400 }
      );
    }

    // Input length validation to prevent DoS
    if (items.length > 50) {
      return NextResponse.json(
        { error: 'Çok fazla ürün (maksimum 50)' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = ['card', 'bank'];
    if (payment_method && !validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme yöntemi' },
        { status: 400 }
      );
    }

    // Check stock status for all items
    const productIds = items.map((item: any) => item.product_id);
    const { data: stockData } = await supabase
      .from('product_stock')
      .select('product_id, in_stock')
      .in('product_id', productIds);

    // Create stock lookup map (default to in stock if not in table)
    const stockStatus: Record<string, boolean> = {};
    stockData?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
    });

    // Check if any item is out of stock
    const outOfStockItems = items.filter((item: any) =>
      stockStatus[item.product_id] === false
    );

    if (outOfStockItems.length > 0) {
      const outOfStockNames = outOfStockItems.map((item: any) => item.product_title).join(', ');
      return NextResponse.json(
        { error: `Stokta olmayan ürünler: ${outOfStockNames}` },
        { status: 400 }
      );
    }

    // Generate cryptographically secure order number
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: payment_method === 'bank' ? 'pending' : 'processing',
        total_amount,
        shipping_address_id,
        order_note: sanitizedOrderNote,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_subtitle: item.product_subtitle,
      product_image: item.product_image,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Fetch complete order with items
    const { data: completeOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    return safeErrorResponse(error, 'Sipariş oluşturulamadı');
  }
}

// PATCH - Sipariş durumunu güncelle (kullanıcı sadece iptal edebilir)
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
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
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Check if order is in a cancellable state
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: 'Bu sipariş artık iptal edilemez' },
        { status: 400 }
      );
    }

    // Update order status
    const { data, error } = await supabase
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
    return safeErrorResponse(error, 'Sipariş güncellenemedi');
  }
}