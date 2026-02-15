import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured, EMAIL_FROM } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimitAsync,
  getClientIP,
  requireSameOrigin,
  sanitizeEmail,
  escapeHtml,
  safeErrorResponse
} from '@/lib/security';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function getWelcomeEmailHtml(email: string): string {
  const safeEmail = escapeHtml(email);
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

      <div style="text-align: center; margin-bottom: 32px;">
        <p style="color: #1a1a1a; font-size: 15px; line-height: 1.6; margin: 0;">
          Yeni koleksiyonlar, özel fırsatlar ve duyurular için bizi takipte kalın.
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e8e6e3; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
          Bu e-postayı ${safeEmail} adresine gönderilmiştir.
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
    // Rate limiting - strict for newsletter to prevent spam
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'contact');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    const body = await request.json();
    const { email } = body;

    // Validate and sanitize email
    const normalizedEmail = sanitizeEmail(email);
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

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
          // Create new subscription with unique unsubscribe token
          await supabase
            .from('newsletter_subscribers')
            .insert({
              email: normalizedEmail,
              status: 'active',
              source: 'website',
              unsubscribe_token: crypto.randomUUID(),
            });
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database fails
      }
    }

    // No welcome email for now (only collect emails)

    return NextResponse.json({
      success: true,
      message: 'Bültene başarıyla kaydoldunuz',
    });
  } catch (error) {
    return safeErrorResponse(error, 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
