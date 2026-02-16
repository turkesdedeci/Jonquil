import { Resend } from 'resend';

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isResendConfigured(): boolean {
  return !!resendApiKey;
}

// Email configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Jonquil <noreply@jonquil.com>';
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'info@jonquilstudio.co';

// Types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    address: string;
    city: string;
    district?: string;
    zipCode?: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  shippingCost: string;
  total: string;
}

export interface AbandonedCartEmailData {
  email: string;
  items: Array<{ title: string; quantity: number; price?: string; image?: string }>;
  totalAmount: number;
  cartUrl: string;
}

export interface OrderStatusEmailData {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

const ORDER_STATUS_LABELS: Record<OrderStatusEmailData['status'], string> = {
  pending: 'Ödeme Bekleniyor',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

// Email Templates
export function getContactEmailHtml(data: ContactFormData): string {
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
        <h1 style="color: #0f3f44; font-size: 24px; margin: 0;">Yeni İletişim Mesajı</h1>
      </div>

      <!-- Content -->
      <div style="border-left: 4px solid #0f3f44; padding-left: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Gönderen:</p>
        <p style="margin: 0 0 4px; color: #1a1a1a; font-size: 16px; font-weight: 600;">${escapeHtml(data.name)}</p>
        <p style="margin: 0; color: #666; font-size: 14px;">${escapeHtml(data.email)}</p>
        ${data.phone ? `<p style="margin: 4px 0 0; color: #666; font-size: 14px;">${escapeHtml(data.phone)}</p>` : ''}
      </div>

      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Konu:</p>
        <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${escapeHtml(data.subject)}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Mesaj:</p>
        <div style="background-color: #faf8f5; border-radius: 8px; padding: 20px;">
          <p style="margin: 0; color: #1a1a1a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e8e6e3; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 13px;">
          Bu mesaj jonquil.com iletişim formu üzerinden gönderilmiştir.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getContactAutoReplyHtml(data: ContactFormData): string {
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
        <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Premium Tasarım Porselen</p>
      </div>

      <!-- Content -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px;">Mesajınız Alındı</h2>
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
          Sayın ${escapeHtml(data.name)},<br><br>
          İletişim formumuz aracılığıyla gönderdiğiniz mesaj tarafımıza ulaşmıştır.
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>

      <div style="background-color: #faf8f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #666; font-size: 13px;">Mesajınızın özeti:</p>
        <p style="margin: 0 0 4px; color: #1a1a1a; font-size: 14px;"><strong>Konu:</strong> ${escapeHtml(data.subject)}</p>
        <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.5;"><strong>Mesaj:</strong> ${escapeHtml(data.message.substring(0, 200))}${data.message.length > 200 ? '...' : ''}</p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e8e6e3; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="margin: 0 0 8px; color: #999; font-size: 13px;">
          Teşekkür ederiz,<br>
          <strong style="color: #0f3f44;">Jonquil Ekibi</strong>
        </p>
        <p style="margin: 16px 0 0; color: #999; font-size: 12px;">
          <a href="https://jonquil.com" style="color: #0f3f44; text-decoration: none;">jonquil.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e6e3;">
        <p style="margin: 0; color: #1a1a1a; font-size: 14px;">${escapeHtml(item.title)}</p>
        <p style="margin: 4px 0 0; color: #666; font-size: 13px;">Adet: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e8e6e3; text-align: right;">
        <p style="margin: 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${escapeHtml(item.price)}</p>
      </td>
    </tr>
  `).join('');

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
        <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Premium Tasarım Porselen</p>
      </div>

      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px;">
          <span style="color: #16a34a; font-size: 32px;">✓</span>
        </div>
      </div>

      <!-- Content -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">Siparişiniz Alındı!</h2>
        <p style="color: #666; font-size: 14px; margin: 0;">Sipariş No: <strong style="color: #0f3f44;">${data.orderId}</strong></p>
      </div>

      <div style="margin-bottom: 32px;">
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
          Sayın ${escapeHtml(data.customerName)},<br><br>
          Siparişiniz başarıyla alınmıştır. Ödemeniz onaylandıktan sonra siparişiniz hazırlanmaya başlayacaktır.
        </p>
      </div>

      <!-- Order Details -->
      <div style="margin-bottom: 32px;">
        <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #0f3f44;">Sipariş Detayları</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>

        <table style="width: 100%; margin-top: 16px;">
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">Ara Toplam</td>
            <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${escapeHtml(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">Kargo</td>
            <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${escapeHtml(data.shippingCost)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600; border-top: 1px solid #e8e6e3;">Toplam</td>
            <td style="padding: 12px 0 0; text-align: right; color: #0f3f44; font-size: 18px; font-weight: 600; border-top: 1px solid #e8e6e3;">${escapeHtml(data.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background-color: #faf8f5; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 12px;">Teslimat Adresi</h3>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
          ${escapeHtml(data.customerName)}<br>
          ${escapeHtml(data.shippingAddress.address)}<br>
          ${data.shippingAddress.district ? escapeHtml(data.shippingAddress.district) + ', ' : ''}${escapeHtml(data.shippingAddress.city)}
          ${data.shippingAddress.zipCode ? ' ' + escapeHtml(data.shippingAddress.zipCode) : ''}
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e8e6e3; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">
          Sorularınız için bizimle iletişime geçebilirsiniz:
        </p>
        <p style="margin: 0 0 16px;">
          <a href="mailto:info@jonquil.com" style="color: #0f3f44; text-decoration: none; font-weight: 600;">info@jonquil.com</a>
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

export function getNewOrderNotificationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e8e6e3;">${escapeHtml(item.title)}</td>
      <td style="padding: 8px; border: 1px solid #e8e6e3; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #e8e6e3; text-align: right;">${escapeHtml(item.price)}</td>
    </tr>
  `).join('');

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
      <div style="background-color: #0f3f44; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">🎉 Yeni Sipariş!</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Sipariş No: ${data.orderId}</p>
      </div>

      <!-- Customer Info -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Müşteri Bilgileri</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px; width: 100px;">Ad Soyad:</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${escapeHtml(data.customerName)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">E-posta:</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${escapeHtml(data.customerEmail)}" style="color: #0f3f44;">${escapeHtml(data.customerEmail)}</a></td>
          </tr>
          ${data.customerPhone ? `
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">Telefon:</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px;"><a href="tel:${escapeHtml(data.customerPhone)}" style="color: #0f3f44;">${escapeHtml(data.customerPhone)}</a></td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background-color: #faf8f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 8px;">Teslimat Adresi</h3>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
          ${escapeHtml(data.shippingAddress.address)}<br>
          ${data.shippingAddress.district ? escapeHtml(data.shippingAddress.district) + ', ' : ''}${escapeHtml(data.shippingAddress.city)}
          ${data.shippingAddress.zipCode ? ' ' + escapeHtml(data.shippingAddress.zipCode) : ''}
        </p>
      </div>

      <!-- Order Items -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Sipariş Detayları</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #faf8f5;">
              <th style="padding: 8px; border: 1px solid #e8e6e3; text-align: left; font-size: 13px;">Ürün</th>
              <th style="padding: 8px; border: 1px solid #e8e6e3; text-align: center; font-size: 13px;">Adet</th>
              <th style="padding: 8px; border: 1px solid #e8e6e3; text-align: right; font-size: 13px;">Fiyat</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="border-top: 2px solid #0f3f44; padding-top: 16px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">Ara Toplam:</td>
            <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${escapeHtml(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666; font-size: 14px;">Kargo:</td>
            <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${escapeHtml(data.shippingCost)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">TOPLAM:</td>
            <td style="padding: 8px 0 0; text-align: right; color: #0f3f44; font-size: 20px; font-weight: 700;">${escapeHtml(data.total)}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getOrderStatusUpdateHtml(data: OrderStatusEmailData): string {
  const statusLabel = ORDER_STATUS_LABELS[data.status];
  const trackingBlock = data.status === 'shipped'
    ? `
      <div style="background-color: #faf8f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 8px;">Kargo Takip Bilgileri</h3>
        ${data.trackingNumber ? `<p style="margin: 0 0 6px; color: #666; font-size: 14px;"><strong>Takip No:</strong> ${escapeHtml(data.trackingNumber)}</p>` : ''}
        ${data.trackingUrl ? `<p style="margin: 0; font-size: 14px;"><a href="${escapeHtml(data.trackingUrl)}" style="color: #0f3f44; text-decoration: none;">Kargo Takip Linki</a></p>` : ''}
      </div>
    `
    : '';

  const feedbackBlock = data.status === 'delivered'
    ? `
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #166534; font-size: 14px; margin: 0 0 8px;">Geri Bildirim</h3>
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px;">Siparişiniz hakkında kısa bir geri bildirim paylaşmak ister misiniz?</p>
        <a href="mailto:${escapeHtml(EMAIL_ADMIN)}?subject=${encodeURIComponent('Jonquil - Sipariş Geri Bildirim')}"
           style="color: #0f3f44; text-decoration: none; font-weight: 600;">Geri bildirim gönder</a>
      </div>
    `
    : '';

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
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f3f44; font-size: 24px; margin: 0;">Sipariş Durumu Güncellendi</h1>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="margin: 0; color: #666; font-size: 14px;">Merhaba ${escapeHtml(data.customerName)},</p>
        <p style="margin: 8px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
          Sipariş durumunuz: ${escapeHtml(statusLabel)}
        </p>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
          Sipariş No: <strong>${escapeHtml(data.orderNumber || data.orderId)}</strong>
        </p>
      </div>

      ${trackingBlock}
      ${feedbackBlock}

      <div style="border-top: 1px solid #e8e6e3; padding-top: 20px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">Jonquil Studio</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Send functions
export async function sendContactEmail(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send notification to admin
    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_ADMIN,
      replyTo: data.email,
      subject: `İletişim Formu: ${data.subject}`,
      html: getContactEmailHtml(data),
    });

    // Send auto-reply to user
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      subject: 'Mesajınız Alındı - Jonquil',
      html: getContactAutoReplyHtml(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendOrderEmails(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send confirmation to customer
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customerEmail,
      subject: `Siparişiniz Alındı - #${data.orderId}`,
      html: getOrderConfirmationHtml(data),
    });

    // Send notification to admin
    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_ADMIN,
      subject: `Yeni Sipariş - #${data.orderId} - ${data.total}`,
      html: getNewOrderNotificationHtml(data),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending order emails:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export function getAbandonedCartHtml(data: AbandonedCartEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
        <span style="font-weight: 500; color: #1a1a1a;">${escapeHtml(item.title)}</span>
        <span style="color: #666; font-size: 13px;"> × ${item.quantity}</span>
      </td>
      ${item.price ? `<td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a1a;">${escapeHtml(item.price)}</td>` : ''}
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#0f3f44;">Jonquil</h1>
      <p style="margin:0 0 32px;color:#666;font-size:14px;">Premium Tasarım Porselen</p>

      <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1a1a1a;">Sepetinizde ürünler bekliyor</h2>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
        Sepetinize eklediğiniz ürünleri unutmadık. Aşağıdaki ürünler sizi bekliyor:
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${itemRows}
      </table>

      <p style="margin:0 0 24px;font-size:16px;font-weight:600;color:#1a1a1a;">
        Toplam: ${data.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
      </p>

      <a href="${data.cartUrl}"
        style="display:inline-block;background:#0f3f44;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Sepetimi Tamamla
      </a>

      <p style="margin:32px 0 0;color:#999;font-size:12px;line-height:1.6;">
        Bu e-postayı almak istemiyorsanız <a href="${data.cartUrl}/abonelikten-cik" style="color:#0f3f44;">buraya tıklayın</a>.
        Jonquil Studio — Premium tasarım porselen.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAbandonedCartEmail(data: AbandonedCartEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) return { success: false, error: 'Email service not configured' };
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      subject: 'Sepetinizde ürünler bekliyor 🛒',
      html: getAbandonedCartHtml(data),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    return { success: false, error: 'Failed to send abandoned cart email' };
  }
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const statusLabel = ORDER_STATUS_LABELS[data.status];
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customerEmail,
      subject: `Sipariş Durumu Güncellendi - ${statusLabel}`,
      html: getOrderStatusUpdateHtml(data),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending status email:', error);
    return { success: false, error: 'Failed to send status email' };
  }
}
