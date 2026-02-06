import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allProducts as staticProducts } from '@/data/products';
import { checkRateLimit, getClientIP, safeErrorResponse } from '@/lib/security';

// Enable ISR with 5-minute revalidation (reduces DB load significantly)
export const revalidate = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Transform database product to match static product format
function transformDbProduct(dbProduct: any) {
  return {
    id: dbProduct.id,
    collection: dbProduct.collection,
    family: dbProduct.family || dbProduct.collection?.toUpperCase(),
    images: dbProduct.images || [],
    title: dbProduct.title,
    subtitle: dbProduct.subtitle || null,
    color: dbProduct.color || null,
    code: dbProduct.code || null,
    size: dbProduct.size || null,
    price: dbProduct.price,
    material: dbProduct.material || 'Porselen',
    productType: dbProduct.product_type || null,
    usage: dbProduct.usage || null,
    capacity: dbProduct.capacity || null,
    setSingle: dbProduct.set_single || 'Tek Parça',
    tags: dbProduct.tags || [],
    inStock: dbProduct.in_stock !== false,
    isFromDatabase: true, // Flag to identify database products
  };
}

// GET - Fetch all products (static + database)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for read operations
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'read');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get database products
    let dbProducts: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true) // Only show in-stock products publicly
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbProducts = data.map(transformDbProduct);
      }
    }

    // Get stock status for static products
    let stockStatus: Record<string, boolean> = {};

    if (supabase) {
      const { data: stockData } = await supabase
        .from('product_stock')
        .select('product_id, in_stock');

      if (stockData) {
        stockData.forEach(item => {
          stockStatus[item.product_id] = item.in_stock;
        });
      }
    }

    // Add stock status to static products
    const staticWithStock = staticProducts.map(product => ({
      ...product,
      inStock: stockStatus[product.id] !== false, // Default to in stock
      isFromDatabase: false,
    }));

    // Combine: database products first, then static products
    const allCombinedProducts = [...dbProducts, ...staticWithStock];

    return NextResponse.json({
      products: allCombinedProducts,
      totalCount: allCombinedProducts.length,
      dbProductCount: dbProducts.length,
      staticProductCount: staticProducts.length,
    }, {
      headers: {
        // Cache for 5 minutes, allow stale content for 10 minutes while revalidating
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    // Use safe error response, fallback to static products
    console.error('[Products API]', error instanceof Error ? error.message : error);
    return NextResponse.json({
      products: staticProducts.map(p => ({ ...p, inStock: true, isFromDatabase: false })),
      totalCount: staticProducts.length,
      dbProductCount: 0,
      staticProductCount: staticProducts.length,
    }, {
      headers: {
        // Cache fallback response for 1 minute
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
