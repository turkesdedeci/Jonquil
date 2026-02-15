import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/adminCheck';
import { checkRateLimitAsync, getClientIP, requireSameOrigin } from '@/lib/security';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    // Check if table exists
    const { error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Ürün tablosu zaten mevcut',
        tableExists: true
      });
    }

    // Table doesn't exist - provide SQL to create it
    const sql = `
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50) NOT NULL,
  collection VARCHAR(100) NOT NULL,
  family VARCHAR(100),
  product_type VARCHAR(100),
  material VARCHAR(100) DEFAULT 'Porselen',
  color VARCHAR(100),
  size VARCHAR(100),
  capacity VARCHAR(100),
  code VARCHAR(100),
  usage VARCHAR(100),
  set_single VARCHAR(50) DEFAULT 'Tek Parça',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

    return NextResponse.json({
      success: false,
      message: 'Ürün tablosu bulunamadı. Lütfen aşağıdaki SQL\'i Supabase SQL Editor\'de çalıştırın:',
      sql,
      tableExists: false
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Kurulum hatası' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ tableExists: false });
    }

    // Check if table exists
    const { error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    return NextResponse.json({ tableExists: !error });
  } catch (error) {
    return NextResponse.json({ tableExists: false });
  }
}
