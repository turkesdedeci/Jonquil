import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeString } from '@/lib/security';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/newsletter/unsubscribe?token=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = sanitizeString(searchParams.get('token') || '').slice(0, 64);

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing', request.url));
  }

  if (!supabase) {
    return NextResponse.redirect(new URL('/unsubscribe?error=config', request.url));
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .eq('status', 'active')
    .select('email')
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', request.url));
  }

  return NextResponse.redirect(new URL('/unsubscribe?success=1', request.url));
}
