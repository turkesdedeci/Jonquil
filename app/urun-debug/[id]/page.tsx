import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getProductByIdServer } from '@/lib/products-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

async function getIdFromHeaders(): Promise<string | undefined> {
  try {
    const h = await headers();
    const candidates = [
      h.get('x-debug-product-id'),
      h.get('x-original-url'),
      h.get('x-vercel-original-url'),
      h.get('x-forwarded-uri'),
      h.get('x-forwarded-path'),
      h.get('x-rewrite-url'),
      h.get('x-middleware-rewrite'),
    ].filter(Boolean) as string[];

    for (const raw of candidates) {
      const url = new URL(raw, 'https://example.com');
      const fromQuery = url.searchParams.get('id');
      if (fromQuery) return fromQuery;
      const match = url.pathname.match(/^\/urun-debug\/([^/]+)$/);
      if (match?.[1]) return match[1];
    }
  } catch {
    // ignore header parsing errors
  }
  return undefined;
}

export default async function UrunDebugPage({ params, searchParams }: Props) {
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const headerId = await getIdFromHeaders();
  const id = params?.id || queryId || headerId;
  const normalizedId = id && id !== 'undefined' ? id : null;
  let headerSnapshot: Record<string, string | null> = {};
  let headerError: string | null = null;
  try {
    const h = await headers();
    headerSnapshot = {
      'x-original-url': h.get('x-original-url'),
      'x-vercel-original-url': h.get('x-vercel-original-url'),
      'x-forwarded-uri': h.get('x-forwarded-uri'),
      'x-forwarded-path': h.get('x-forwarded-path'),
      'x-rewrite-url': h.get('x-rewrite-url'),
      'x-middleware-rewrite': h.get('x-middleware-rewrite'),
      'x-debug-middleware': h.get('x-debug-middleware'),
      'x-debug-product-id': h.get('x-debug-product-id'),
    };
  } catch (err: any) {
    headerError = err?.message || 'headers() failed';
    headerSnapshot = {};
  }
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
        idSource: params?.id ? 'params' : (queryId ? 'query' : (headerId ? 'header' : null)),
        params,
        searchParams,
        headerSnapshot,
        headerError,
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
