import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP } from '@/lib/security';

// Enable ISR with 1-minute revalidation for stock data
export const revalidate = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Cache headers for stock data (shorter cache since stock changes frequently)
const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
};

// GET - Fetch all product stock statuses (public endpoint)
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResponse = checkRateLimit(clientIP, 'read');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!supabase) {
    return NextResponse.json({ stockStatus: {} }, { headers: cacheHeaders });
  }

  try {
    const { data, error } = await supabase
      .from('product_stock')
      .select('product_id, in_stock');

    if (error) {
      // Table doesn't exist or other error - return empty
      return NextResponse.json({ stockStatus: {} }, { headers: cacheHeaders });
    }

    // Convert to object for easy lookup
    const stockStatus: Record<string, boolean> = {};
    data?.forEach(item => {
      stockStatus[item.product_id] = item.in_stock;
    });

    return NextResponse.json({ stockStatus }, { headers: cacheHeaders });
  } catch (error) {
    console.error('Error fetching stock status:', error);
    return NextResponse.json({ stockStatus: {} }, { headers: cacheHeaders });
  }
}
