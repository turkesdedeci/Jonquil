import { NextResponse } from 'next/server';

export const revalidate = 86400;

export async function GET() {
  try {
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
