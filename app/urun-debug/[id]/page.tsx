import { getProductByIdServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { id: string };
}

export default async function UrunDebugPage({ params }: Props) {
  const { id } = params;
  const product = await getProductByIdServer(id);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
      <h1>Urun Debug</h1>
      <pre>{JSON.stringify({ id, found: !!product, title: product?.title || null }, null, 2)}</pre>
    </div>
  );
}
