import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimitAsync, getClientIP, sanitizeString, sanitizeEmail } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// POST — upsert cart snapshot (called from CartContext on change)
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rl = await checkRateLimitAsync(clientIP, 'write');
    if (rl) return rl;

    if (!supabase) return NextResponse.json({ ok: true }); // silent no-op if not configured

    const { userId } = await auth();
    const body = await request.json();

    const sessionId: string = sanitizeString(body.sessionId || '').slice(0, 64);
    const email: string | null = body.email ? sanitizeEmail(body.email) : null;
    const items = Array.isArray(body.items) ? body.items : [];
    const totalAmount: number = typeof body.totalAmount === 'number' ? body.totalAmount : 0;

    if (!sessionId) return NextResponse.json({ ok: true });

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
    if (!supabase) return NextResponse.json({ ok: true });

    const { searchParams } = new URL(request.url);
    const sessionId = sanitizeString(searchParams.get('sessionId') || '').slice(0, 64);
    if (!sessionId) return NextResponse.json({ ok: true });

    await supabase
      .from('abandoned_carts')
      .update({ converted_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
