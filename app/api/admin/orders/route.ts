import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

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

// Allowed domains for tracking URLs (Turkish cargo companies)
const ALLOWED_TRACKING_DOMAINS = [
  'yurticikargo.com',
  'mngkargo.com',
  'aaborakargo.com',
  'aras.com.tr',
  'ptt.gov.tr',
  'trendyol.com',
  'hepsiburada.com',
  'ups.com',
  'dhl.com',
  'fedex.com',
  'sendeo.com.tr',
  'borusan.com',
  'suratcargo.com',
];

// Validate tracking URL
function isValidTrackingUrl(url: string): boolean {
  if (!url) return true; // Empty is allowed (optional)

  try {
    const parsedUrl = new URL(url);

    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Check if domain is in allowed list
    const hostname = parsedUrl.hostname.toLowerCase();
    return ALLOWED_TRACKING_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
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
    const { orderId, status, tracking_number, tracking_url } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId ve status gerekli' }, { status: 400 });
    }

    // Geçerli status kontrolü
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz status' }, { status: 400 });
    }

    // Validate tracking URL if provided
    if (tracking_url && !isValidTrackingUrl(tracking_url)) {
      return NextResponse.json({
        error: 'Geçersiz kargo takip linki. Sadece güvenilir kargo sitelerinin HTTPS linkleri kabul edilir.'
      }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add tracking info if provided
    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number;
    }
    if (tracking_url !== undefined) {
      updateData.tracking_url = tracking_url;
    }

    // Siparişi güncelle
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
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
