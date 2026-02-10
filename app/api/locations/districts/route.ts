import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');
    if (!provinceId) {
      return NextResponse.json({ data: [] }, { status: 400 });
    }
    if (!/^\d{1,4}$/.test(provinceId)) {
      return NextResponse.json({ data: [] }, { status: 400 });
    }
    const res = await fetch(`https://api.turkiyeapi.dev/v1/districts?provinceId=${provinceId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
