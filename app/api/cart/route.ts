import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimitAsync, getClientIP, requireSameOrigin, sanitizeString, sanitizeEmail } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const MAX_CART_ITEMS = 50;
const MAX_TOTAL_AMOUNT = 1_000_000;
const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

type SanitizedCartItem = {
  title: string;
  product_title: string;
  quantity: number;
  price: number;
  image: string;
};

function sanitizeCartItems(items: unknown): SanitizedCartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, MAX_CART_ITEMS)
    .map((item) => {
      const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const quantityRaw = typeof record.quantity === 'number' ? record.quantity : Number(record.quantity || 1);
      const quantity = Number.isFinite(quantityRaw) ? Math.max(1, Math.min(99, Math.floor(quantityRaw))) : 1;

      const priceRaw = typeof record.price === 'number' ? record.price : Number(record.price || 0);
      const price = Number.isFinite(priceRaw) ? Math.max(0, Math.min(MAX_TOTAL_AMOUNT, priceRaw)) : 0;

      return {
        title: sanitizeString(typeof record.title === 'string' ? record.title : '').slice(0, 200),
        product_title: sanitizeString(
          typeof record.product_title === 'string' ? record.product_title : ''
        ).slice(0, 200),
        quantity,
        price,
        image: sanitizeString(typeof record.image === 'string' ? record.image : '').slice(0, 1000),
      };
    });
}

// POST — upsert cart snapshot (called from CartContext on change)
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rl = await checkRateLimitAsync(clientIP, 'write');
    if (rl) return rl;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    if (!supabase) return NextResponse.json({ ok: true }); // silent no-op if not configured

    const { userId } = await auth();
    const body = await request.json();

    const sessionId: string = sanitizeString(body.sessionId || '').slice(0, 64);
    const email: string | null = body.email ? sanitizeEmail(body.email) : null;
    const items = sanitizeCartItems(body.items);
    const rawTotalAmount = typeof body.totalAmount === 'number' ? body.totalAmount : Number(body.totalAmount || 0);
    const totalAmount =
      Number.isFinite(rawTotalAmount) ? Math.max(0, Math.min(MAX_TOTAL_AMOUNT, rawTotalAmount)) : 0;

    if (!sessionId || !SESSION_ID_REGEX.test(sessionId)) return NextResponse.json({ ok: true });

    // Empty cart → mark converted so cron skips it
    if (items.length === 0) {
      await supabase
        .from('abandoned_carts')
        .update({ converted_at: new Date().toISOString(), items: [] })
        .eq('session_id', sessionId);
      return NextResponse.json({ ok: true });
    }

    await supabase
      .from('abandoned_carts')
      .upsert(
        {
          session_id: sessionId,
          email,
          user_id: userId ?? null,
          items,
          total_amount: totalAmount,
          // Reset reminder if cart changes after a reminder was already sent
          reminder_sent_at: null,
          converted_at: null,
        },
        { onConflict: 'session_id' }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // silent — don't break checkout
  }
}

// DELETE — mark cart as converted when order is placed
export async function DELETE(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rl = await checkRateLimitAsync(clientIP, 'write');
    if (rl) return rl;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    if (!supabase) return NextResponse.json({ ok: true });

    const { searchParams } = new URL(request.url);
    const sessionId = sanitizeString(searchParams.get('sessionId') || '').slice(0, 64);
    if (!sessionId || !SESSION_ID_REGEX.test(sessionId)) return NextResponse.json({ ok: true });

    await supabase
      .from('abandoned_carts')
      .update({ converted_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
