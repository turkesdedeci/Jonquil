import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimit,
  getClientIP,
  validateFileSignature,
  validateFileSize,
  safeErrorResponse
} from '@/lib/security';

// Admin emails from environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// Supabase client with service key for storage operations
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

// Allowed file types (validated by magic bytes, not just MIME type)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 4; // 4MB (Vercel limit is 4.5MB)

// POST - Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for uploads (strict)
    const clientIP = getClientIP(request);
    const rateLimitResponse = checkRateLimit(clientIP, 'upload');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Validate file size first (quick check)
    const sizeValidation = validateFileSize(file, MAX_FILE_SIZE_MB);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Validate file by magic bytes (more secure than MIME type)
    const signatureValidation = await validateFileSignature(file, ALLOWED_TYPES);
    if (!signatureValidation.valid) {
      return NextResponse.json(
        { error: signatureValidation.error || 'Desteklenmeyen dosya türü. Sadece JPEG, PNG, WebP ve GIF desteklenir.' },
        { status: 400 }
      );
    }

    // Use detected type for extension (more reliable than file.name)
    const typeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = typeToExt[signatureValidation.detectedType!] || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `products/${timestamp}-${randomStr}.${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage with validated content type
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: signatureValidation.detectedType!,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);

      // Check if bucket doesn't exist
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json({
          error: 'Storage bucket bulunamadı. Lütfen Supabase\'de "images" adında bir bucket oluşturun.',
          hint: 'Supabase Dashboard > Storage > New Bucket > Name: images, Public: Yes'
        }, { status: 400 });
      }

      return NextResponse.json({ error: 'Resim yüklenemedi' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    return safeErrorResponse(error, 'Resim yüklenirken bir hata oluştu');
  }
}

// DELETE - Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Dosya yolu gerekli' }, { status: 400 });
    }

    // Security check: only allow deleting from products folder
    if (!path.startsWith('products/')) {
      return NextResponse.json({ error: 'Geçersiz dosya yolu' }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Resim silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error, 'Resim silinirken bir hata oluştu');
  }
}
