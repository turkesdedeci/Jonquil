import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Admin emails from environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  return user.emailAddresses.some(
    email => ADMIN_EMAILS.includes(email.emailAddress)
  );
}

// Input validation
function validateProduct(data: any): { valid: boolean; error?: string } {
  if (!data.title || data.title.length > 255) {
    return { valid: false, error: 'Ürün adı gerekli (maksimum 255 karakter)' };
  }
  if (!data.price || data.price.length > 50) {
    return { valid: false, error: 'Fiyat gerekli' };
  }
  if (!data.collection || data.collection.length > 100) {
    return { valid: false, error: 'Koleksiyon gerekli' };
  }
  if (data.subtitle && data.subtitle.length > 255) {
    return { valid: false, error: 'Alt başlık çok uzun' };
  }
  if (data.images && data.images.length > 20) {
    return { valid: false, error: 'Maksimum 20 resim eklenebilir' };
  }
  return { valid: true };
}

// GET - List all products from database
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({ products: [], tableExists: false });
    }

    return NextResponse.json({ products: products || [], tableExists: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();

    // Validate input
    const validation = validateProduct(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      title,
      subtitle,
      price,
      collection,
      family,
      product_type,
      material,
      color,
      size,
      capacity,
      code,
      usage,
      set_single,
      images,
      tags,
      in_stock
    } = body;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        price: price.trim(),
        collection: collection.trim().toLowerCase(),
        family: family?.trim() || null,
        product_type: product_type?.trim() || null,
        material: material?.trim() || 'Porselen',
        color: color?.trim() || null,
        size: size?.trim() || null,
        capacity: capacity?.trim() || null,
        code: code?.trim() || null,
        usage: usage?.trim() || null,
        set_single: set_single?.trim() || 'Tek Parça',
        images: images || [],
        tags: tags || [],
        in_stock: in_stock !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Product create error:', error);

      // Check if table doesn't exist
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({
          error: 'Products tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
          hint: 'Admin panelinde "Ürün Yönetimi" sekmesinde tablo kurulum butonuna tıklayın.'
        }, { status: 400 });
      }

      return NextResponse.json({ error: `Ürün oluşturulamadı: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    // Validate if title or price being updated
    if (updateData.title || updateData.price || updateData.collection) {
      const validation = validateProduct({
        title: updateData.title || 'placeholder',
        price: updateData.price || '0',
        collection: updateData.collection || 'placeholder',
        ...updateData
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Clean up data
    const cleanData: Record<string, any> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = typeof value === 'string' ? value.trim() : value;
      }
    });

    const { data: product, error } = await supabase
      .from('products')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      return NextResponse.json({ error: 'Ürün güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Product delete error:', error);
      return NextResponse.json({ error: 'Ürün silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
