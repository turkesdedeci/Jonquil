import { NextRequest, NextResponse } from 'next/server';
import { getProductByIdServer } from '@/lib/products-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const product = await getProductByIdServer(id);

  if (!product) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    id: product.id,
    title: product.title,
    collection: product.collection,
    isFromDatabase: product.isFromDatabase,
  });
}
