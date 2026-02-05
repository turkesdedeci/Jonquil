import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured, EMAIL_FROM } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function getWelcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #0f3f44; font-size: 28px; margin: 0; font-weight: 300; letter-spacing: 4px;">JONQUIL</h1>
        <p style="color: #666; font-size: 14px; margin: 8px 0 0;">El Yapımı Porselen</p>
      </div>

      <!-- Content -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px;">Bültenimize Hoş Geldiniz!</h2>
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
          Artık yeni koleksiyonlarımızdan, özel indirimlerden ve el yapımı porselen dünyasından haberdar olacaksınız.
        </p>
      </div>

      <div style="background-color: #faf8f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="color: #0f3f44; font-size: 16px; font-weight: 600; margin: 0 0 8px;">İlk Siparişinize Özel</p>
        <p style="color: #1a1a1a; font-size: 32px; font-weight: 700; margin: 0;">%10 İNDİRİM</p>
        <p style="color: #666; font-size: 13px; margin: 8px 0 0;">Kupon kodu: HOSGELDIN10</p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="https://jonquil.com" style="display: inline-block; background-color: #0f3f44; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">Alışverişe Başla</a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e8e6e3; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
          Bu e-postayı ${email} adresine gönderilmiştir.
        </p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          <a href="https://jonquil.com" style="color: #0f3f44; text-decoration: none;">jonquil.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Save to database if available
    if (supabase) {
      try {
        // Check if already subscribed
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('id, status')
          .eq('email', normalizedEmail)
          .single();

        if (existing) {
          if (existing.status === 'active') {
            return NextResponse.json(
              { error: 'Bu e-posta adresi zaten kayıtlı' },
              { status: 400 }
            );
          } else {
            // Reactivate subscription
            await supabase
              .from('newsletter_subscribers')
              .update({ status: 'active', updated_at: new Date().toISOString() })
              .eq('id', existing.id);
          }
        } else {
          // Create new subscription
          await supabase
            .from('newsletter_subscribers')
            .insert({
              email: normalizedEmail,
              status: 'active',
              source: 'website',
            });
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database fails
      }
    }

    // Send welcome email
    if (isResendConfigured() && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          subject: 'Jonquil Bültenine Hoş Geldiniz!',
          html: getWelcomeEmailHtml(normalizedEmail),
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bültene başarıyla kaydoldunuz',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
