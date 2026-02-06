import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Veritabanı bağlantısı yapılandırılmamış' },
        { status: 500 }
      );
    }

    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Sipariş numarası ve e-posta adresi gerekli' },
        { status: 400 }
      );
    }

    // Input length validation
    if (orderNumber.length > 50) {
      return NextResponse.json(
        { error: 'Geçersiz sipariş numarası' },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      .eq('order_number', orderNumber.trim().toUpperCase())
      .eq('customer_email', email.trim().toLowerCase())
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
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
