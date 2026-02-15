import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { allProducts as staticProducts } from '@/data/products';
import { checkRateLimitAsync, getClientIP, safeErrorResponse } from '@/lib/security';
import { buildDefaultProductDescription } from '@/lib/product-description';
import { sortProductsForCatalog } from '@/lib/product-sort';

// Enable ISR with 5-minute revalidation (reduces DB load significantly)
export const revalidate = 300;
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Transform database product to match static product format
function transformDbProduct(dbProduct: any) {
  const fallbackDescription = buildDefaultProductDescription({
    title: dbProduct.title,
    material: dbProduct.material,
    productType: dbProduct.product_type,
    usage: dbProduct.usage,
  });

  return {
    id: dbProduct.id,
    collection: dbProduct.collection,
    family: dbProduct.family || dbProduct.collection?.toUpperCase(),
    images: dbProduct.images || [],
    title: dbProduct.title,
    subtitle: dbProduct.subtitle || null,
    description: dbProduct.description || fallbackDescription,
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

function pickNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function resolveImages(
  baseImages: unknown,
  overrideImages: unknown
): string[] {
  const fallback = Array.isArray(baseImages)
    ? baseImages.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
  const override = Array.isArray(overrideImages)
    ? overrideImages.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];

  return override.length > 0 ? override : fallback;
}

// GET - Fetch all products (static + database)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for read operations
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get database products
    let dbProducts: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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
        .select('product_id, in_stock, stock_quantity, low_stock_threshold');

      if (stockData) {
        stockData.forEach(item => {
          const isOutOfStock = typeof item.stock_quantity === 'number' && item.stock_quantity <= 0;
          stockStatus[item.product_id] = isOutOfStock ? false : item.in_stock;
        });
      }
    }

    // Get product overrides (for static products)
    let overrides: Record<string, any> = {};

    if (supabase) {
      const { data: overrideData } = await supabase
        .from('product_overrides')
        .select('*');

      if (overrideData) {
        overrideData.forEach(item => {
          overrides[item.product_id] = item;
        });
      }
    }

    // Add stock status + overrides to static products
    const staticWithStock = staticProducts.map(product => {
      const override = overrides[product.id];
      const merged = {
        ...product,
        ...override,
        images: resolveImages(product.images, override?.images),
      };
      const resolvedProductType =
        pickNonEmptyString(override?.product_type, override?.productType, product.productType) ?? null;
      const resolvedSetSingle =
        pickNonEmptyString(override?.set_single, override?.setSingle, product.setSingle) ?? 'Tek Parça';
      const resolvedMaterial =
        pickNonEmptyString(override?.material, product.material) ?? 'Porselen';
      const resolvedDescription =
        pickNonEmptyString(override?.description, (product as any).description) ??
        buildDefaultProductDescription({
          title: merged.title,
          material: resolvedMaterial,
          productType: resolvedProductType,
          usage: merged.usage,
        });

      return {
        ...merged,
        productType: resolvedProductType,
        setSingle: resolvedSetSingle,
        material: resolvedMaterial,
        description: resolvedDescription,
        inStock: stockStatus[product.id] !== false, // Default to in stock
        isFromDatabase: false,
      };
    });

    const dbWithOverrides = dbProducts.map(product => {
      const override = overrides[product.id];
      const merged = {
        ...product,
        ...override,
        images: resolveImages(product.images, override?.images),
      };
      const stockOverride = stockStatus[product.id];
      const resolvedProductType =
        pickNonEmptyString(override?.product_type, override?.productType, product.productType) ?? null;
      const resolvedSetSingle =
        pickNonEmptyString(override?.set_single, override?.setSingle, product.setSingle) ?? 'Tek Parça';
      const resolvedMaterial =
        pickNonEmptyString(override?.material, product.material) ?? 'Porselen';
      const resolvedDescription =
        pickNonEmptyString(override?.description, product.description) ??
        buildDefaultProductDescription({
          title: merged.title,
          material: resolvedMaterial,
          productType: resolvedProductType,
          usage: merged.usage,
        });

      return {
        ...merged,
        productType: resolvedProductType,
        setSingle: resolvedSetSingle,
        material: resolvedMaterial,
        description: resolvedDescription,
        inStock: stockOverride !== undefined ? stockOverride : merged.inStock !== false,
        isFromDatabase: true,
      };
    });

    // Combine: database products first, then static products
    const allCombinedProducts = sortProductsForCatalog(
      [...dbWithOverrides, ...staticWithStock].filter((p) => p.inStock !== false)
    );

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
