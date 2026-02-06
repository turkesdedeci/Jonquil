import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// Admin check helper
async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  return user.emailAddresses.some(email => ADMIN_EMAILS.includes(email.emailAddress));
}

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
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ stockStatus: {}, tableExists: false });
  }

  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select('product_id, in_stock');

    if (error) {
      // Table probably doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({ stockStatus: {}, tableExists: false });
      }
      throw error;
    }

    // Convert to object for easy lookup
    const stockStatus: Record<string, boolean> = {};
    data?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
    });

    return NextResponse.json({ stockStatus, tableExists: true });
  } catch (error) {
    console.error('Error fetching stock status:', error);
    return NextResponse.json({ stockStatus: {}, tableExists: false });
  }
}

// PATCH - Update product stock status (admin only)
export async function PATCH(request: NextRequest) {
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
    const { productId, inStock } = await request.json();

    if (!productId || typeof inStock !== 'boolean') {
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        },
        { status: 400 }
      );
    }

    // Upsert the stock status
    const { error } = await supabase
      .from('product_stock')
      .upsert({
        product_id: productId,
        in_stock: inStock,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'product_id'
      });

    if (error) throw error;

    return NextResponse.json({ success: true, productId, inStock });
  } catch (error: any) {
    console.error('Error updating stock status:', error);
    return NextResponse.json(
      { error: error?.message || 'Stok durumu güncellenemedi' },
      { status: 500 }
    );
  }
}
