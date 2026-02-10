import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/adminCheck';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper to ensure table exists
async function ensureTableExists() {
  if (!supabase) return false;

  try {
    // Try to create the table if it doesn't exist
    await supabase.rpc('create_product_stock_table_if_not_exists').catch(() => {
      // RPC might not exist, that's okay
    });

    // Check if table exists by trying a simple query
    const { error } = await supabase
      .from('product_stock')
      .select('product_id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist - we need to create it via SQL
      // For now, return false and let the user create it
      return false;
    }

    return !error;
  } catch {
    return false;
  }
}

// GET - Fetch all product stock statuses
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
  if (rateLimitResponse) return rateLimitResponse;

  // Admin check
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json({ stockStatus: {}, stockDetails: {}, tableExists: false });
  }

  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select('product_id, in_stock, stock_quantity, low_stock_threshold');

    if (error) {
      // Table probably doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({ stockStatus: {}, stockDetails: {}, tableExists: false });
      }
      throw error;
    }

    // Convert to object for easy lookup
    const stockStatus: Record<string, boolean> = {};
    const stockDetails: Record<string, { in_stock: boolean; stock_quantity: number | null; low_stock_threshold: number | null }> = {};
    data?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
      stockDetails[item.product_id] = {
        in_stock: item.in_stock,
        stock_quantity: item.stock_quantity ?? null,
        low_stock_threshold: item.low_stock_threshold ?? null,
      };
    });

    return NextResponse.json({ stockStatus, stockDetails, tableExists: true });
  } catch (error) {
    console.error('Error fetching stock status:', error);
    return NextResponse.json({ stockStatus: {}, stockDetails: {}, tableExists: false });
  }
}

// PATCH - Update product stock status (admin only)
export async function PATCH(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  // Admin check
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: 'Veritabanı bağlantısı yapılandırılmamış' },
      { status: 500 }
    );
  }

  try {
    const { productId, inStock, stockQuantity, lowStockThreshold } = await request.json();

    if (!productId || (typeof inStock !== 'boolean' && typeof stockQuantity !== 'number' && typeof lowStockThreshold !== 'number')) {
      return NextResponse.json(
        { error: 'Geçersiz parametreler' },
        { status: 400 }
      );
    }

    // First check if table exists
    const { error: checkError } = await supabase
      .from('product_stock')
      .select('product_id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      return NextResponse.json(
        {
          error: 'Tablo bulunamadı. Lütfen Supabase\'de product_stock tablosunu oluşturun.',
          sqlHint: `CREATE TABLE product_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      product_id: productId,
      updated_at: new Date().toISOString()
    };
    if (typeof inStock === 'boolean') {
      updateData.in_stock = inStock;
    }
    if (typeof stockQuantity === 'number') {
      updateData.stock_quantity = stockQuantity;
    }
    if (typeof lowStockThreshold === 'number') {
      updateData.low_stock_threshold = lowStockThreshold;
    }
    if (typeof stockQuantity === 'number' && stockQuantity <= 0) {
      updateData.in_stock = false;
    }

    // Upsert the stock status
    const { error } = await supabase
      .from('product_stock')
      .upsert(updateData, {
        onConflict: 'product_id'
      });

    if (error) throw error;

    return NextResponse.json({ success: true, productId, inStock, stockQuantity, lowStockThreshold });
  } catch (error: any) {
    console.error('Error updating stock status:', error);
    return NextResponse.json(
      { error: error?.message || 'Stok durumu güncellenemedi' },
      { status: 500 }
    );
  }
}
