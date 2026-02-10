import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  checkRateLimitAsync,
  getClientIP,
  sanitizeString,
  safeErrorResponse,
  handleDatabaseError
} from '@/lib/security';

// GET - Kullanıcının favorilerini getir
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Favoriler yüklenemedi');
  }
}

// POST - Favorilere ekle
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const body = await request.json();
    const productId = sanitizeString(body.productId as string).slice(0, 100);

    if (!productId) {
      return NextResponse.json({ error: 'productId gerekli' }, { status: 400 });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Zaten favorilerde' });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error, 'Favori eklenemedi');
  }
}

// DELETE - Favorilerden kaldır
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'write');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const productId = sanitizeString(searchParams.get('productId') || '').slice(0, 100);

    if (!productId) {
      return NextResponse.json({ error: 'productId gerekli' }, { status: 400 });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      return handleDatabaseError(error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error, 'Favori silinemedi');
  }
}
