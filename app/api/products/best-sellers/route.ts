import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimitAsync, getClientIP, safeErrorResponse } from '@/lib/security';
import { getAllProductsServer } from '@/lib/products-server';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (!supabase) {
      return NextResponse.json({ products: [] }, { status: 500 });
    }

    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('product_id, product_title, quantity, total_price');

    if (error) {
      return NextResponse.json({ products: [] }, { status: 500 });
    }

    const counts = new Map<string, { qty: number; revenue: number; title?: string }>();
    (orderItems || []).forEach((item: any) => {
      const key = item.product_id || item.product_title;
      if (!key) return;
      const current = counts.get(key) || { qty: 0, revenue: 0, title: item.product_title };
      counts.set(key, {
        qty: current.qty + (item.quantity || 0),
        revenue: current.revenue + (item.total_price || 0),
        title: current.title || item.product_title,
      });
    });

    const allProducts = await getAllProductsServer();
    const productById = new Map(allProducts.map(p => [p.id, p]));
    const productByTitle = new Map(allProducts.map(p => [normalizeTitle(p.title), p]));

    const bestSellerProducts = Array.from(counts.entries())
      .map(([key, data]) => {
        const byId = productById.get(key);
        if (byId) {
          return { product: byId, qty: data.qty, revenue: data.revenue };
        }
        const normalizedTitle = data.title ? normalizeTitle(data.title) : normalizeTitle(String(key));
        const byTitle = productByTitle.get(normalizedTitle);
        if (byTitle) {
          return { product: byTitle, qty: data.qty, revenue: data.revenue };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (b as any).qty - (a as any).qty)
      .slice(0, 4)
      .map(item => ({
        ...(item as any).product,
      }));

    return NextResponse.json({ products: bestSellerProducts }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Best sellers yüklenemedi');
  }
}
