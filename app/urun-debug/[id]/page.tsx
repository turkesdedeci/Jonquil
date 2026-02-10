import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getProductByIdServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function UrunDebugPage({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { id: paramId } = await params;
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const id = paramId || queryId;
  const normalizedId = id && id !== 'undefined' ? id : null;
  const product = normalizedId ? await getProductByIdServer(normalizedId) : null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;
  const urlHost = supabaseUrl ? new URL(supabaseUrl).host : null;
  const projectRef = urlHost ? urlHost.split('.')[0] : null;

  let directResult: { ok: boolean; title?: string; error?: string } = { ok: false };
  if (!normalizedId) {
    directResult = { ok: false, error: 'invalid id' };
  } else if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('products')
        .select('id,title')
        .eq('id', normalizedId)
        .single();
      if (error || !data) {
        directResult = { ok: false, error: error?.message || 'not found' };
      } else {
        directResult = { ok: true, title: data.title };
      }
    } catch (err: any) {
      directResult = { ok: false, error: err?.message || 'exception' };
    }
  } else {
    directResult = { ok: false, error: 'missing env' };
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
      <h1>Urun Debug</h1>
      <pre>{JSON.stringify({
        id,
        idSource: paramId ? 'params' : (queryId ? 'query' : null),
        params: { id: paramId },
        searchParams,
        found: !!product,
        title: product?.title || null,
        env: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          hasAnonKey: !!supabaseAnonKey,
          urlHost,
          projectRef,
        },
        directResult,
      }, null, 2)}</pre>
    </div>
  );
}
