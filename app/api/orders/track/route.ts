import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimit,
  getClientIP,
  sanitizeString,
  sanitizeEmail,
  safeErrorResponse
} from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for order tracking to prevent enumeration
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'auth');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Veritabanı bağlantısı yapılandırılmamış' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Sipariş numarası ve e-posta adresi gerekli' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedOrderNumber = sanitizeString(orderNumber).slice(0, 50);
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedOrderNumber) {
      return NextResponse.json(
        { error: 'Geçersiz sipariş numarası' },
        { status: 400 }
      );
    }

    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    // Find order by order number and email
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        shipping_cost,
        created_at,
        updated_at,
        shipping_address,
        shipping_city,
        shipping_district,
        customer_first_name,
        customer_last_name,
        tracking_number,
        tracking_url,
        estimated_delivery
      `)
      .eq('order_number', sanitizedOrderNumber.toUpperCase())
      .eq('customer_email', sanitizedEmail)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.' },
        { status: 404 }
      );
    }

    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    // Get order status history if exists
    const { data: statusHistory } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      order: {
        ...order,
        items: items || [],
        statusHistory: statusHistory || []
      }
    });
  } catch (error) {
    return safeErrorResponse(error, 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
