import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitAsync, getClientIP, safeErrorResponse } from '@/lib/security';

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return safeErrorResponse(error, 'CSP report error');
  }
}
