import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckoutForm, isIyzicoConfigured, type BasketItem, type Buyer, type Address } from '@/lib/iyzico';
import { headers } from 'next/headers';
import { getProductByIdServer, getProductPriceServer } from '@/lib/products-server';
import {
  checkRateLimitAsync,
  getClientIP,
  requireSameOrigin,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  safeErrorResponse
} from '@/lib/security';

// Shipping cost configuration
const SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49.9;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for payment operations
    const clientIP = getClientIP(request);
    const rateLimitResponse = await checkRateLimitAsync(clientIP, 'auth');
    if (rateLimitResponse) return rateLimitResponse;
    const originCheck = requireSameOrigin(request);
    if (originCheck) return originCheck;

    // Check if iyzico is configured
    if (!isIyzicoConfigured()) {
      return NextResponse.json(
        { error: 'Ödeme sistemi yapılandırılmamış' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      orderId,
      items,
      buyer: buyerInfo,
      shippingAddress: shippingInfo,
      billingAddress: billingInfo,
    } = body;

    // Validate required fields
    if (!orderId || !items || !buyerInfo || !shippingInfo) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    // Validate items count
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { error: 'Geçersiz ürün listesi' },
        { status: 400 }
      );
    }

    // Sanitize buyer info
    const sanitizedBuyer = {
      id: sanitizeString(buyerInfo.id || '').slice(0, 100),
      firstName: sanitizeString(buyerInfo.firstName || '').slice(0, 100),
      lastName: sanitizeString(buyerInfo.lastName || '').slice(0, 100),
      email: sanitizeEmail(buyerInfo.email || '') || '',
      phone: sanitizePhone(buyerInfo.phone || '') || '+905000000000',
      identityNumber: sanitizeString(buyerInfo.identityNumber || '11111111111').slice(0, 11),
    };

    // Validate sanitized buyer
    if (!sanitizedBuyer.firstName || !sanitizedBuyer.lastName || !sanitizedBuyer.email) {
      return NextResponse.json(
        { error: 'Geçersiz alıcı bilgileri' },
        { status: 400 }
      );
    }

    // Sanitize address info
    const sanitizedShipping = {
      address: sanitizeString(shippingInfo.address || '').slice(0, 500),
      city: sanitizeString(shippingInfo.city || '').slice(0, 100),
      zipCode: sanitizeString(shippingInfo.zipCode || '34000').slice(0, 10),
    };

    // SERVER-SIDE PRICE VALIDATION
    // Calculate total from server-side product data (prevent price manipulation)
    let serverCalculatedSubtotal = 0;
    const validatedBasketItems: BasketItem[] = [];

    for (const item of items) {
      const productId = item.id || item.productId;
      const serverProduct = await getProductByIdServer(productId);

      if (!serverProduct) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${productId}` },
          { status: 400 }
        );
      }

      const serverPrice = await getProductPriceServer(productId);
      if (serverPrice === null) {
        return NextResponse.json(
          { error: `Ürün fiyatı alınamadı: ${productId}` },
          { status: 400 }
        );
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = serverPrice * quantity;
      serverCalculatedSubtotal += itemTotal;

      // Use server-side price for basket items
      validatedBasketItems.push({
        id: productId,
        name: serverProduct.title.substring(0, 50), // Max 50 chars
        category1: serverProduct.productType || 'Porselen',
        category2: serverProduct.material || 'El Yapımı',
        itemType: 'PHYSICAL',
        price: itemTotal.toFixed(2),
      });
    }

    // Add shipping cost (match frontend rule)
    const shippingCost = serverCalculatedSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const serverCalculatedTotal = serverCalculatedSubtotal + shippingCost;

    // Get client IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || '127.0.0.1';

    // Format buyer with sanitized data
    const buyer: Buyer = {
      id: sanitizedBuyer.id || `BUYER_${orderId}`,
      name: sanitizedBuyer.firstName,
      surname: sanitizedBuyer.lastName,
      email: sanitizedBuyer.email,
      identityNumber: sanitizedBuyer.identityNumber,
      registrationAddress: sanitizedShipping.address,
      city: sanitizedShipping.city,
      country: 'Turkey',
      ip: ip,
      gsmNumber: sanitizedBuyer.phone,
    };

    // Format shipping address with sanitized data
    const shippingAddress: Address = {
      contactName: `${sanitizedBuyer.firstName} ${sanitizedBuyer.lastName}`,
      city: sanitizedShipping.city,
      country: 'Turkey',
      address: sanitizedShipping.address,
      zipCode: sanitizedShipping.zipCode,
    };

    // Format billing address (use shipping if not provided)
    const billingAddress: Address = billingInfo ? {
      contactName: `${sanitizeString(billingInfo.firstName || sanitizedBuyer.firstName).slice(0, 100)} ${sanitizeString(billingInfo.lastName || sanitizedBuyer.lastName).slice(0, 100)}`,
      city: sanitizeString(billingInfo.city || sanitizedShipping.city).slice(0, 100),
      country: 'Turkey',
      address: sanitizeString(billingInfo.address || sanitizedShipping.address).slice(0, 500),
      zipCode: sanitizeString(billingInfo.zipCode || sanitizedShipping.zipCode).slice(0, 10),
    } : shippingAddress;

    // Use SERVER-CALCULATED price (not client-sent)
    const price = serverCalculatedTotal.toFixed(2);

    // Get callback URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = headersList.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/api/iyzico/callback`;

    // Initialize checkout form with server-validated prices
    const result = await initializeCheckoutForm({
      conversationId: orderId,
      price,
      paidPrice: price,
      currency: 'TRY',
      basketId: `BASKET_${orderId}`,
      callbackUrl,
      buyer,
      shippingAddress,
      billingAddress,
      basketItems: validatedBasketItems,
    });

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        checkoutFormContent: result.checkoutFormContent,
        token: result.token,
        tokenExpireTime: result.tokenExpireTime,
        // Return server-calculated total for display
        serverSubtotal: serverCalculatedSubtotal,
        serverShipping: shippingCost,
        serverTotal: serverCalculatedTotal,
      });
    } else {
      console.error('iyzico error:', result);
      return NextResponse.json(
        {
          error: result.errorMessage || 'Ödeme başlatılamadı',
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return safeErrorResponse(error, 'Ödeme başlatılırken bir hata oluştu');
  }
}
