import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  checkRateLimitAsync,
  getClientIP,
  sanitizeString,
  sanitizePhone,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';

// Validate and sanitize address data
function sanitizeAddressData(body: Record<string, unknown>) {
  return {
    title: sanitizeString(body.title as string).slice(0, 100),
    full_name: sanitizeString(body.full_name as string).slice(0, 200),
    phone: sanitizePhone(body.phone as string) || '',
    address_line: sanitizeString(body.address_line as string).slice(0, 500),
    district: sanitizeString(body.district as string).slice(0, 100),
    city: sanitizeString(body.city as string).slice(0, 100),
    postal_code: sanitizeString(body.postal_code as string).slice(0, 10),
    is_default: Boolean(body.is_default),
  };
}

// GET - Kullanıcının tüm adreslerini getir
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Adresler yüklenemedi');
  }
}

// POST - Yeni adres ekle
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const sanitizedData = sanitizeAddressData(body);

    // Validate required fields
    if (!sanitizedData.title || !sanitizedData.full_name || !sanitizedData.address_line || !sanitizedData.city) {
      return NextResponse.json({ error: 'Zorunlu alanları doldurun' }, { status: 400 });
    }

    // Eğer varsayılan adres ise, diğerlerini false yap
    if (sanitizedData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        ...sanitizedData
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return safeErrorResponse(error, 'Adres eklenemedi');
  }
}

// PUT - Adres güncelle
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Adres ID gerekli' }, { status: 400 });
    }

    const sanitizedData = sanitizeAddressData(body);

    // Eğer varsayılan adres ise, diğerlerini false yap
    if (sanitizedData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(sanitizedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error, 'Adres güncellenemedi');
  }
}

// DELETE - Adres sil
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Adres ID gerekli' }, { status: 400 });
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Geçersiz adres ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error, 'Adres silinemedi');
  }
}
