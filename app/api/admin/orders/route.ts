import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimitAsync,
  getClientIP,
  requireSameOrigin,
  sanitizeString,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';
import { isAdmin } from '@/lib/adminCheck';
import { sendOrderStatusEmail } from '@/lib/resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// GET - Tüm siparişleri getir
export async function GET(request: NextRequest) {
  try {
    // Rate limiting (async for Redis support)
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Admin kontrolü
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Supabase bağlantı kontrolü
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // Tüm siparişleri çek (en yeniden eskiye)
    const { data: orders, error } = await adminSupabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError(error);
    }

    const safeOrders = orders || [];
    const addressIds = safeOrders
      .map((order: any) => order.shipping_address_id)
      .filter(Boolean);

    let addressMap = new Map<string, { full_name?: string; phone?: string }>();

    if (addressIds.length > 0) {
      const { data: addresses } = await adminSupabase
        .from('addresses')
        .select('id, full_name, phone')
        .in('id', Array.from(new Set(addressIds)));

      if (addresses) {
        addressMap = new Map(addresses.map((addr: any) => [addr.id, addr]));
      }
    }

    const enrichedOrders = safeOrders.map((order: any) => {
      if (order.customer_first_name || order.customer_last_name) return order;
      const addr = order.shipping_address_id ? addressMap.get(order.shipping_address_id) : null;
      if (!addr?.full_name) return order;
      const nameParts = String(addr.full_name).trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      return {
        ...order,
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: order.customer_phone || addr.phone || order.customer_phone,
      };
    });

    return NextResponse.json(enrichedOrders, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Siparişler yüklenemedi');
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
    // Rate limiting (async for Redis support)
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    // Admin kontrolü
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Supabase bağlantı kontrolü
    if (!adminSupabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, status, tracking_number, tracking_url } = body;

    // Sanitize tracking number if provided
    const sanitizedTrackingNumber = tracking_number ? sanitizeString(tracking_number).slice(0, 100) : undefined;

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

    // Add tracking info if provided (sanitized)
    if (sanitizedTrackingNumber !== undefined) {
      updateData.tracking_number = sanitizedTrackingNumber;
    }
    if (tracking_url !== undefined) {
      updateData.tracking_url = tracking_url;
    }

    // Fetch existing order for status comparison & email info
    const { data: existingOrder, error: existingOrderError } = await adminSupabase
      .from('orders')
      .select('id, order_number, status, customer_first_name, customer_last_name, customer_email, tracking_number, tracking_url')
      .eq('id', orderId)
      .single();

    if (existingOrderError) {
      console.error('[Admin Orders] Fetch error:', JSON.stringify(existingOrderError, null, 2));
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: existingOrderError.message || 'fetch_failed' },
        { status: 500 }
      );
    }

    if (existingOrder?.status === status) {
      return NextResponse.json(existingOrder);
    }

    // Siparişi güncelle
    const { data, error } = await adminSupabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Orders] Update error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: error.message || 'update_failed' },
        { status: 500 }
      );
    }

    // Audit log: order status update
    await logAuditEvent({
      action: 'order_status_update',
      resource_type: 'order',
      resource_id: orderId,
      details: {
        new_status: status,
        tracking_number: sanitizedTrackingNumber || null,
        tracking_url: tracking_url || null,
      },
    }, request);

    // Send status update email (best-effort)
    if (data?.customer_email) {
      const customerName = `${data.customer_first_name || ''} ${data.customer_last_name || ''}`.trim() || 'Müşteri';
      sendOrderStatusEmail({
        orderId: data.id,
        orderNumber: data.order_number,
        customerName,
        customerEmail: data.customer_email,
        status: data.status,
        trackingNumber: data.tracking_number || null,
        trackingUrl: data.tracking_url || null,
      }).catch((err) => {
        console.error('Failed to send status email:', err);
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error, 'Sipariş güncellenemedi');
  }
}
