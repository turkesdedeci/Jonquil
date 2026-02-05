import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, isResendConfigured, type ContactFormData } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    // Prepare contact data
    const contactData: ContactFormData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
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
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
