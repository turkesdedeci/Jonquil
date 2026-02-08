import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;

  const urlHost = supabaseUrl ? new URL(supabaseUrl).host : null;
  const projectRef = urlHost ? urlHost.split('.')[0] : null;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        error: 'missing env',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!supabaseAnonKey,
        urlHost,
        projectRef,
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    let recentIds: Array<{ id: string; title: string; created_at?: string }> = [];
    try {
      const { data: recent } = await supabase
        .from('products')
        .select('id,title,created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (recent) recentIds = recent as Array<{ id: string; title: string; created_at?: string }>;
    } catch {}

    return NextResponse.json(
      {
        error: error?.message || 'not found',
        urlHost,
        projectRef,
        recentIds,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    title: data.title,
    collection: data.collection,
    urlHost,
    projectRef,
  });
}
