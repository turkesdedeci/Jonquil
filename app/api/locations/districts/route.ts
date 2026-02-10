import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');
    if (!provinceId) {
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
