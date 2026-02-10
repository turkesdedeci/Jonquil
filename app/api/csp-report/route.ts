import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitAsync, getClientIP, safeErrorResponse } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => ({}));
    console.warn('[CSP] Violation report', {
      time: new Date().toISOString(),
      body,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return safeErrorResponse(error, 'CSP report error');
  }
}
