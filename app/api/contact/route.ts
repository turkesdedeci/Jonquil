import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, isResendConfigured, type ContactFormData } from '@/lib/resend';
import {
  checkRateLimitAsync,
  getClientIP,
  sanitizeString,
  sanitizeEmail,
  escapeHtml,
  safeErrorResponse
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for contact form to prevent spam
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'contact');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check if Resend is configured
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email servisi yapılandırılmamış' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Input length validation to prevent DoS
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'İsim çok uzun (maksimum 100 karakter)' },
        { status: 400 }
      );
    }
    if (email.length > 254) {
      return NextResponse.json(
        { error: 'E-posta çok uzun' },
        { status: 400 }
      );
    }
    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'Konu çok uzun (maksimum 200 karakter)' },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Mesaj çok uzun (maksimum 5000 karakter)' },
        { status: 400 }
      );
    }
    if (phone && phone.length > 20) {
      return NextResponse.json(
        { error: 'Telefon numarası çok uzun' },
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    // Prepare contact data with sanitization
    const contactData: ContactFormData = {
      name: escapeHtml(sanitizeString(name)),
      email: sanitizedEmail,
      phone: phone ? sanitizeString(phone) : undefined,
      subject: escapeHtml(sanitizeString(subject)),
      message: escapeHtml(sanitizeString(message)),
    };

    // Send emails
    const result = await sendContactEmail(contactData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Mesajınız başarıyla gönderildi',
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Mesaj gönderilemedi' },
        { status: 500 }
      );
    }
  } catch (error) {
    return safeErrorResponse(error, 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
