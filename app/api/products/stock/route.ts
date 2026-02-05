import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// GET - Fetch all product stock statuses (public endpoint)
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ stockStatus: {} });
  }

  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select('product_id, in_stock');

    if (error) {
      // Table doesn't exist or other error - return empty
      return NextResponse.json({ stockStatus: {} });
    }

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
