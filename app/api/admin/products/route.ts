import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// GET - Fetch all product stock statuses
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ stockStatus: {} });
  }

  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select('product_id, in_stock');

    if (error) throw error;

    // Convert to object for easy lookup
    const stockStatus: Record<string, boolean> = {};
    data?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
    });

    return NextResponse.json({ stockStatus });
  } catch (error) {
    console.error('Error fetching stock status:', error);
    return NextResponse.json({ stockStatus: {} });
  }
}

// PATCH - Update product stock status
export async function PATCH(request: NextRequest) {
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
  } catch (error) {
    console.error('Error updating stock status:', error);
    return NextResponse.json(
      { error: 'Stok durumu güncellenemedi' },
      { status: 500 }
    );
  }
}
