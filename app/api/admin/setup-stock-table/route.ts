import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/adminCheck';
import { checkRateLimitAsync, getClientIP, requireSameOrigin } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
  if (rateLimitResponse) return rateLimitResponse;
  const originCheck = requireSameOrigin(request);
  if (originCheck) return originCheck;

  // Admin check
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase yapılandırması eksik' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First check if table already exists
    const { error: checkError } = await supabase
      .from('product_stock')
      .select('product_id')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Tablo zaten mevcut'
      });
    }

    if (checkError.code !== '42P01') {
      throw checkError;
    }

    // Table doesn't exist, create it using raw SQL via Supabase's REST API
    // We need to use the SQL Editor approach since supabase-js doesn't have direct SQL execution
    // Instead, we'll create a workaround by inserting and letting it fail, then providing instructions

    // Try to create via RPC if available
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS product_stock (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id TEXT UNIQUE NOT NULL,
          in_stock BOOLEAN DEFAULT true,
          stock_quantity INTEGER,
          low_stock_threshold INTEGER DEFAULT 5,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE product_stock
          ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
        ALTER TABLE product_stock
          ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
      `
    });

    if (rpcError) {
      // RPC not available, return SQL for manual creation
      return NextResponse.json({
        success: false,
        message: 'Tablo otomatik oluşturulamadı. Lütfen Supabase SQL Editor\'da aşağıdaki SQL\'i çalıştırın:',
        sql: `CREATE TABLE product_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE product_stock
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
ALTER TABLE product_stock
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- RLS politikası (opsiyonel)
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON product_stock
  FOR SELECT USING (true);

CREATE POLICY "Allow service role all" ON product_stock
  FOR ALL USING (auth.role() = 'service_role');`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tablo başarıyla oluşturuldu'
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Tablo oluşturulamadı' },
      { status: 500 }
    );
  }
}
