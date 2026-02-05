import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Admin email listesi
const ADMIN_EMAILS = ['turkesdedeci@icloud.com'];

// Admin kontrolü
async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;

  return user.emailAddresses.some(
    email => ADMIN_EMAILS.includes(email.emailAddress)
  );
}

// GET - Tüm siparişleri getir
export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Supabase bağlantı kontrolü
    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // Tüm siparişleri çek (en yeniden eskiye)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Siparişler çekilirken hata:', error);
      return NextResponse.json({ error: 'Siparişler yüklenemedi' }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PATCH - Sipariş durumunu güncelle
export async function PATCH(request: NextRequest) {
  try {
    // Admin kontrolü
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Supabase bağlantı kontrolü
    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId ve status gerekli' }, { status: 400 });
    }

    // Geçerli status kontrolü
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz status' }, { status: 400 });
    }

    // Siparişi güncelle
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Sipariş güncellenirken hata:', error);
      return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
