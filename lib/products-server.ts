import { createClient } from '@supabase/supabase-js';
import { allProducts as staticProducts } from '@/data/products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use service key for server-side operations
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface ServerProduct {
  id: string;
  collection: string;
  family: string;
  images: string[];
  title: string;
  subtitle: string | null;
  color: string | null;
  code: string | null;
  size: string | null;
  price: string;
  material: string;
  productType: string | null;
  usage: string | null;
  capacity: string | null;
  setSingle: string;
  tags: string[];
  inStock: boolean;
  isFromDatabase: boolean;
}

// Transform database product to match static product format
function transformDbProduct(dbProduct: any): ServerProduct {
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
    isFromDatabase: true,
  };
}

// Get all products for server-side use (includes database products)
export async function getAllProductsServer(): Promise<ServerProduct[]> {
  // Get database products
  let dbProducts: ServerProduct[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
;

      if (!error && data) {
        dbProducts = data.map(transformDbProduct);
      }
    } catch (err) {
      console.error('Failed to fetch database products:', err);
    }
  }

  // Get stock status for static products
  let stockStatus: Record<string, boolean> = {};

  if (supabase) {
    try {
      const { data: stockData } = await supabase
        .from('product_stock')
        .select('product_id, in_stock, stock_quantity, low_stock_threshold');

      if (stockData) {
        stockData.forEach(item => {
          const isOutOfStock = typeof item.stock_quantity === 'number' && item.stock_quantity <= 0;
          stockStatus[item.product_id] = isOutOfStock ? false : item.in_stock;
        });
      }
    } catch (err) {
      // Stock table might not exist yet
    }
  }

  // Get product overrides (for static products)
  let overrides: Record<string, any> = {};

  if (supabase) {
    try {
      const { data: overrideData } = await supabase
        .from('product_overrides')
        .select('*');

      if (overrideData) {
        overrideData.forEach(item => {
          overrides[item.product_id] = item;
        });
      }
    } catch (err) {
      // Overrides table might not exist yet
    }
  }

  // Add stock status + overrides to static products
  const staticWithStock: ServerProduct[] = staticProducts.map(product => {
    const override = overrides[product.id];
    const overrideProductType = override?.product_type ?? override?.productType;
    const overrideSetSingle = override?.set_single ?? override?.setSingle;
    const merged = { ...product, ...override };
    return {
      ...merged,
      productType: overrideProductType ?? merged.productType,
      setSingle: overrideSetSingle ?? merged.setSingle,
      inStock: stockStatus[product.id] !== false,
      isFromDatabase: false,
    } as ServerProduct;
  });

  const dbWithOverrides: ServerProduct[] = dbProducts.map(product => {
    const override = overrides[product.id];
    const overrideProductType = override?.product_type ?? override?.productType;
    const overrideSetSingle = override?.set_single ?? override?.setSingle;
    const merged = { ...product, ...override } as any;
    const stockOverride = stockStatus[product.id];
    return {
      ...merged,
      productType: overrideProductType ?? merged.productType,
      setSingle: overrideSetSingle ?? merged.setSingle,
      inStock: stockOverride !== undefined ? stockOverride : merged.inStock !== false,
      isFromDatabase: true,
    } as ServerProduct;
  });

  // Combine: database products first, then static products
  return [...dbWithOverrides, ...staticWithStock];
}

// Find a product by ID (server-side)
export async function getProductByIdServer(productId: string): Promise<ServerProduct | null> {
  if (!productId || productId === 'undefined') {
    console.warn('[getProductByIdServer] Missing/invalid productId:', productId);
    return null;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!error && data) {
        const dbProduct = transformDbProduct(data);
        console.log(`[getProductByIdServer] Found product in DB: ${dbProduct.title}`);
        return dbProduct;
      }
    } catch (err) {
      console.error('[getProductByIdServer] DB lookup failed:', err);
    }
  }

  const allProducts = await getAllProductsServer();
  const foundProduct = allProducts.find(p => p.id === productId);
  console.log(`[getProductByIdServer] Searching in combined list for ID: ${productId}, Found: ${!!foundProduct}`);
  return foundProduct || null;
}

// Get product price as number (server-side)
export async function getProductPriceServer(productId: string): Promise<number | null> {
  const product = await getProductByIdServer(productId);
  if (!product) return null;
  // Parse price like "1250 ₺/adet" -> 1250
  const priceMatch = product.price.match(/[\d.]+/);
  return priceMatch ? parseFloat(priceMatch[0]) : null;
}
