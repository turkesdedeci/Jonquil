import { NextResponse } from 'next/server';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

export const revalidate = 86400;

export async function GET(request: Request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const res = await fetch('https://api.turkiyeapi.dev/v1/provinces', {
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
