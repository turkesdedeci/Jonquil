import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckoutForm, isIyzicoConfigured, type BasketItem, type Buyer, type Address } from '@/lib/iyzico';
import { headers } from 'next/headers';
import { allProducts } from '@/data/products';

// Helper to get product price from server data
function getServerProductPrice(productId: string): number | null {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return null;
  // Parse price like "1250 ₺/adet" -> 1250
  const priceMatch = product.price.match(/[\d.]+/);
  return priceMatch ? parseFloat(priceMatch[0]) : null;
}

// Helper to get product by ID
function getServerProduct(productId: string) {
  return allProducts.find(p => p.id === productId);
}

// Shipping cost configuration
const SHIPPING_COST = 0; // Free shipping

export async function POST(request: NextRequest) {
  try {
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

    // SERVER-SIDE PRICE VALIDATION
    // Calculate total from server-side product data (prevent price manipulation)
    let serverCalculatedTotal = 0;
    const validatedBasketItems: BasketItem[] = [];

    for (const item of items) {
      const productId = item.id || item.productId;
      const serverProduct = getServerProduct(productId);

      if (!serverProduct) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${productId}` },
          { status: 400 }
        );
      }

      const serverPrice = getServerProductPrice(productId);
      if (serverPrice === null) {
        return NextResponse.json(
          { error: `Ürün fiyatı alınamadı: ${productId}` },
          { status: 400 }
        );
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = serverPrice * quantity;
      serverCalculatedTotal += itemTotal;

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

    // Add shipping cost
    serverCalculatedTotal += SHIPPING_COST;

    // Get client IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || '127.0.0.1';

    // Format buyer
    const buyer: Buyer = {
      id: buyerInfo.id || `BUYER_${orderId}`,
      name: buyerInfo.firstName,
      surname: buyerInfo.lastName,
      email: buyerInfo.email,
      identityNumber: buyerInfo.identityNumber || '11111111111', // TC Kimlik No
      registrationAddress: shippingInfo.address,
      city: shippingInfo.city,
      country: 'Turkey',
      ip: ip,
      gsmNumber: buyerInfo.phone || '+905000000000',
    };

    // Format shipping address
    const shippingAddress: Address = {
      contactName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
      city: shippingInfo.city,
      country: 'Turkey',
      address: shippingInfo.address,
      zipCode: shippingInfo.zipCode || '34000',
    };

    // Format billing address (use shipping if not provided)
    const billingAddress: Address = billingInfo ? {
      contactName: `${billingInfo.firstName || buyerInfo.firstName} ${billingInfo.lastName || buyerInfo.lastName}`,
      city: billingInfo.city || shippingInfo.city,
      country: 'Turkey',
      address: billingInfo.address || shippingInfo.address,
      zipCode: billingInfo.zipCode || shippingInfo.zipCode || '34000',
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
    console.error('iyzico initialize error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
