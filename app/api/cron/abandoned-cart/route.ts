import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAbandonedCartEmail } from '@/lib/resend';
import { getSiteUrl } from '@/lib/site';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Vercel Cron calls this with Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Verify cron secret to prevent unauthorized calls
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }

  const siteUrl = getSiteUrl();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Find carts: updated >1h ago, has an email, reminder not sent, not converted
  const { data: carts, error } = await supabase
    .from('abandoned_carts')
    .select('id, email, items, total_amount')
    .lt('updated_at', oneHourAgo)
    .not('email', 'is', null)
    .is('reminder_sent_at', null)
    .is('converted_at', null)
    .limit(50); // process in batches

  if (error) {
    console.error('[cron/abandoned-cart] Query error:', error);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const cart of carts ?? []) {
    if (!cart.email || !Array.isArray(cart.items) || cart.items.length === 0) continue;

    const result = await sendAbandonedCartEmail({
      email: cart.email,
      items: cart.items.map((item: any) => ({
        title: item.title || item.product_title || 'Ürün',
        quantity: item.quantity || 1,
        price: item.price,
        image: item.image,
      })),
      totalAmount: cart.total_amount ?? 0,
      cartUrl: `${siteUrl}/`,
    });

    if (result.success) {
      await supabase
        .from('abandoned_carts')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', cart.id);
      sent++;
    } else {
      failed++;
    }
  }

  console.info(`[cron/abandoned-cart] sent=${sent} failed=${failed}`);
  return NextResponse.json({ ok: true, sent, failed });
}
