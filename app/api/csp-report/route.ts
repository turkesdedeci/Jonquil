import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimitAsync, getClientIP, safeErrorResponse } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > 65536) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => ({}));
    const payload = JSON.stringify(body).slice(0, 10000);
    console.warn('[CSP] Violation report', {
      time: new Date().toISOString(),
      body: payload,
    });

    if (supabase) {
      await supabase
        .from('csp_reports')
        .insert({
          reported_at: new Date().toISOString(),
          ip: clientIP,
          report: payload,
        });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return safeErrorResponse(error, 'CSP report error');
  }
}
