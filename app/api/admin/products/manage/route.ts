import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimitAsync,
  getClientIP,
  requireSameOrigin,
  sanitizeString,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';
import { isAdmin } from '@/lib/adminCheck';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

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
  if (data.description && data.description.length > 2000) {
    return { valid: false, error: 'Açıklama çok uzun (maksimum 2000 karakter)' };
  }
  if (data.images && data.images.length > 20) {
    return { valid: false, error: 'Maksimum 20 resim eklenebilir' };
  }
  return { valid: true };
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => uuidRegex.test(value);

function sanitizeOverrideData(updateData: any): Record<string, unknown> {
  const cleanData: Record<string, unknown> = {};
  const stringFields = [
    'title', 'subtitle', 'description', 'price', 'collection', 'family', 'product_type',
    'material', 'color', 'size', 'capacity', 'code', 'usage', 'set_single'
  ];
  const allowedFields = new Set([...stringFields, 'images', 'tags']);

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && allowedFields.has(key)) {
      if (stringFields.includes(key) && typeof value === 'string') {
        cleanData[key] = sanitizeString(value).slice(0, key === 'description' ? 2000 : 255);
      } else if (key === 'tags' && Array.isArray(value)) {
        cleanData[key] = value.map((t: string) => sanitizeString(t).slice(0, 50)).slice(0, 20);
      } else if (key === 'images' && Array.isArray(value)) {
        cleanData[key] = value.slice(0, 20);
      }
    }
  });

  return cleanData;
}

// GET - List all products from database
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

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
      // Table doesn't exist yet
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ products: [], tableExists: false });
      }
      return handleDatabaseError(error);
    }

    let overrides: any[] = [];
    let overridesTableExists = true;
    const { data: overrideData, error: overrideError } = await supabase
      .from('product_overrides')
      .select('*');

    if (overrideError) {
      if (overrideError.message?.includes('does not exist') || overrideError.code === '42P01') {
        overridesTableExists = false;
      } else {
        return handleDatabaseError(overrideError);
      }
    } else {
      overrides = overrideData || [];
    }

    return NextResponse.json({ products: products || [], overrides, tableExists: true, overridesTableExists });
  } catch (error) {
    return safeErrorResponse(error, 'Ürünler yüklenemedi');
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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

    const body = await request.json();

    // Validate input
    const validation = validateProduct(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Sanitize all string inputs
    const sanitizedDescription =
      typeof body.description === 'string'
        ? sanitizeString(body.description).slice(0, 2000)
        : null;

    const sanitizedData = {
      title: sanitizeString(body.title).slice(0, 255),
      subtitle: body.subtitle ? sanitizeString(body.subtitle).slice(0, 255) : null,
      price: sanitizeString(body.price).slice(0, 50),
      collection: sanitizeString(body.collection).toLowerCase().slice(0, 100),
      family: body.family ? sanitizeString(body.family).slice(0, 100) : null,
      product_type: body.product_type ? sanitizeString(body.product_type).slice(0, 100) : null,
      material: body.material ? sanitizeString(body.material).slice(0, 100) : 'Porselen',
      color: body.color ? sanitizeString(body.color).slice(0, 50) : null,
      size: body.size ? sanitizeString(body.size).slice(0, 50) : null,
      capacity: body.capacity ? sanitizeString(body.capacity).slice(0, 50) : null,
      code: body.code ? sanitizeString(body.code).slice(0, 50) : null,
      usage: body.usage ? sanitizeString(body.usage).slice(0, 100) : null,
      set_single: body.set_single ? sanitizeString(body.set_single).slice(0, 50) : 'Tek Parça',
      images: Array.isArray(body.images) ? body.images.slice(0, 20) : [],
      tags: Array.isArray(body.tags) ? body.tags.map((t: string) => sanitizeString(t).slice(0, 50)).slice(0, 20) : [],
      in_stock: body.in_stock !== false
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      // Check if table doesn't exist
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({
          error: 'Products tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
          hint: 'Admin panelinde "Ürün Yönetimi" sekmesinde tablo kurulum butonuna tıklayın.'
        }, { status: 400 });
      }

      return handleDatabaseError(error);
    }

    if (sanitizedDescription) {
      const { error: overrideError } = await supabase
        .from('product_overrides')
        .upsert(
          {
            product_id: product.id,
            description: sanitizedDescription,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'product_id' }
        );

      if (overrideError) {
        if (overrideError.message?.includes('does not exist') || overrideError.code === '42P01') {
          return NextResponse.json({
            error: "Açıklama kaydı için product_overrides tablosu bulunamadı. Lütfen aşağıdaki SQL'i Supabase SQL Editor'de çalıştırın:",
            sql: `CREATE TABLE IF NOT EXISTS product_overrides (
  product_id TEXT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50),
  collection VARCHAR(100),
  family VARCHAR(100),
  product_type VARCHAR(100),
  material VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  capacity VARCHAR(100),
  code VARCHAR(100),
  usage VARCHAR(100),
  set_single VARCHAR(50),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all" ON product_overrides
  FOR ALL USING (auth.role() = 'service_role');`
          }, { status: 400 });
        }
        return handleDatabaseError(overrideError);
      }
    }

    // Audit log: product created
    await logAuditEvent({
      action: 'product_create',
      resource_type: 'product',
      resource_id: product.id,
      details: {
        title: sanitizedData.title,
        collection: sanitizedData.collection,
        price: sanitizedData.price,
      },
    }, request);
    
    // Revalidate paths
    revalidatePath('/urunler');
    revalidatePath(`/urun/${product.id}`);

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        description: sanitizedDescription,
      },
    }, { status: 201 });
  } catch (error) {
    return safeErrorResponse(error, 'Ürün oluşturulamadı');
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    if (!isUuid(id)) {
      const cleanData = sanitizeOverrideData(updateData);
      if (Object.keys(cleanData).length === 0) {
        return NextResponse.json({ error: 'Güncelleme verisi gerekli' }, { status: 400 });
      }

      const { data: override, error: overrideError } = await supabase
        .from('product_overrides')
        .upsert({
          product_id: id,
          ...cleanData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id' })
        .select()
        .single();

      if (overrideError) {
        if (overrideError.message?.includes('does not exist') || overrideError.code === '42P01') {
          return NextResponse.json({
            error: "Overrides tablosu bulunamadı. Lütfen aşağıdaki SQL'i Supabase SQL Editor'de çalıştırın:",
            sql: `CREATE TABLE IF NOT EXISTS product_overrides (
  product_id TEXT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50),
  collection VARCHAR(100),
  family VARCHAR(100),
  product_type VARCHAR(100),
  material VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  capacity VARCHAR(100),
  code VARCHAR(100),
  usage VARCHAR(100),
  set_single VARCHAR(50),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all" ON product_overrides
  FOR ALL USING (auth.role() = 'service_role');`
          }, { status: 400 });
        }
        return NextResponse.json(
          {
            error: 'Veritabanı hatası',
            debug: {
              message: overrideError.message,
              code: overrideError.code,
              details: (overrideError as any).details,
            }
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, override });
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

    // Sanitize and clean up data
    const descriptionForOverride =
      typeof updateData.description === 'string'
        ? sanitizeString(updateData.description).slice(0, 2000)
        : undefined;
    const cleanData: Record<string, unknown> = {};
    const stringFields = ['title', 'subtitle', 'price', 'collection', 'family', 'product_type',
                          'material', 'color', 'size', 'capacity', 'code', 'usage', 'set_single'];
    const allowedFields = new Set([...stringFields, 'tags', 'images', 'in_stock']);

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && allowedFields.has(key)) {
        if (stringFields.includes(key) && typeof value === 'string') {
          cleanData[key] = sanitizeString(value).slice(0, 255);
        } else if (key === 'tags' && Array.isArray(value)) {
          cleanData[key] = value.map((t: string) => sanitizeString(t).slice(0, 50)).slice(0, 20);
        } else if (key === 'images' && Array.isArray(value)) {
          cleanData[key] = value.slice(0, 20);
        } else {
          cleanData[key] = value;
        }
      }
    });

    let product: any[] | null = null;
    let error: any = null;

    if (Object.keys(cleanData).length > 0) {
      const updateResult = await supabase
        .from('products')
        .update(cleanData)
        .eq('id', id)
        .select();

      product = updateResult.data;
      error = updateResult.error;
    } else {
      const existingResult = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .limit(1);

      product = existingResult.data;
      error = existingResult.error;
    }

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({
          error: 'Products tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
          hint: 'Admin panelinde "Ürün Yönetimi" sekmesinde tablo kurulum butonuna tıklayın.'
        }, { status: 400 });
      }
      return NextResponse.json(
        {
          error: 'Veritabanı hatası',
          debug: {
            message: error.message,
            code: error.code,
            details: (error as any).details,
          }
        },
        { status: 500 }
      );
    }

    if (!product || product.length === 0) {
      const cleanOverrideData = sanitizeOverrideData(updateData);
      if (Object.keys(cleanOverrideData).length === 0) {
        return NextResponse.json({ error: 'Güncelleme verisi gerekli' }, { status: 400 });
      }

      const { data: override, error: overrideError } = await supabase
        .from('product_overrides')
        .upsert({
          product_id: id,
          ...cleanOverrideData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id' })
        .select()
        .single();

      if (overrideError) {
        if (overrideError.message?.includes('does not exist') || overrideError.code === '42P01') {
          return NextResponse.json({
            error: "Overrides tablosu bulunamadı. Lütfen aşağıdaki SQL'i Supabase SQL Editor'de çalıştırın:",
            sql: `CREATE TABLE IF NOT EXISTS product_overrides (
  product_id TEXT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50),
  collection VARCHAR(100),
  family VARCHAR(100),
  product_type VARCHAR(100),
  material VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  capacity VARCHAR(100),
  code VARCHAR(100),
  usage VARCHAR(100),
  set_single VARCHAR(50),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all" ON product_overrides
  FOR ALL USING (auth.role() = 'service_role');`
          }, { status: 400 });
        }
        return NextResponse.json(
          {
            error: 'Veritabanı hatası',
            debug: {
              message: overrideError.message,
              code: overrideError.code,
              details: (overrideError as any).details,
            }
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, override });
    }

    if (descriptionForOverride !== undefined) {
      const { error: overrideError } = await supabase
        .from('product_overrides')
        .upsert({
          product_id: id,
          description: descriptionForOverride || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id' });

      if (overrideError) {
        if (overrideError.message?.includes('does not exist') || overrideError.code === '42P01') {
          return NextResponse.json({
            error: "Açıklama kaydı için product_overrides tablosu bulunamadı. Lütfen aşağıdaki SQL'i Supabase SQL Editor'de çalıştırın:",
            sql: `CREATE TABLE IF NOT EXISTS product_overrides (
  product_id TEXT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  price VARCHAR(50),
  collection VARCHAR(100),
  family VARCHAR(100),
  product_type VARCHAR(100),
  material VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  capacity VARCHAR(100),
  code VARCHAR(100),
  usage VARCHAR(100),
  set_single VARCHAR(50),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all" ON product_overrides
  FOR ALL USING (auth.role() = 'service_role');`
          }, { status: 400 });
        }
        return handleDatabaseError(overrideError);
      }
    }

    // Audit log: product updated
    const updatedFields = Object.keys(cleanData);
    if (descriptionForOverride !== undefined) {
      updatedFields.push('description');
    }
    await logAuditEvent({
      action: 'product_update',
      resource_type: 'product',
      resource_id: id,
      details: {
        updated_fields: updatedFields,
      },
    }, request);
    
    // Revalidate paths
    revalidatePath('/urunler');
    revalidatePath(`/urun/${id}`);

    return NextResponse.json({ success: true, product: product[0] });
  } catch (error) {
    return safeErrorResponse(error, 'Ürün güncellenemedi');
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }

    if (!isUuid(id)) {
      const { error } = await supabase
        .from('product_overrides')
        .delete()
        .eq('product_id', id);

      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          return NextResponse.json({
            error: 'Overrides tablosu bulunamadı. Lütfen önce tabloyu oluşturun.'
          }, { status: 400 });
        }
        return handleDatabaseError(error);
      }

      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return handleDatabaseError(error);
    }

    // Audit log: product deleted
    await logAuditEvent({
      action: 'product_delete',
      resource_type: 'product',
      resource_id: id,
      details: {},
    }, request);

    // Revalidate paths
    revalidatePath('/urunler');
    revalidatePath(`/urun/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error, 'Ürün silinemedi');
  }
}
