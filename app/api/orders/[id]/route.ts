import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  checkRateLimitAsync,
  getClientIP,
  safeErrorResponse
} from '@/lib/security';

// GET - Tek bir siparişi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
  if (rateLimitResponse) return rateLimitResponse;

  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: orderId } = await params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    // Siparişi getir (kullanıcı kontrolü ile)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Sipariş ürünlerini getir
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Teslimat adresini getir
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();

    return NextResponse.json({
      ...order,
      items: items || [],
      shipping_address: address || null,
    });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return safeErrorResponse(error, 'Sipariş getirilemedi');
  }
}
