import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimitAsync,
  getClientIP,
  sanitizeString,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

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

    return NextResponse.json({ products: products || [], tableExists: true });
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

    return NextResponse.json({ success: true, product }, { status: 201 });
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Geçersiz ürün ID' }, { status: 400 });
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
    const cleanData: Record<string, unknown> = {};
    const stringFields = ['title', 'subtitle', 'price', 'collection', 'family', 'product_type',
                          'material', 'color', 'size', 'capacity', 'code', 'usage', 'set_single'];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
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

    const { data: product, error } = await supabase
      .from('products')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    // Audit log: product updated
    await logAuditEvent({
      action: 'product_update',
      resource_type: 'product',
      resource_id: id,
      details: {
        updated_fields: Object.keys(cleanData),
      },
    }, request);

    return NextResponse.json({ success: true, product });
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Geçersiz ürün ID' }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error, 'Ürün silinemedi');
  }
}
