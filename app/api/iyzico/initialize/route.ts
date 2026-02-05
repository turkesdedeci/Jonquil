import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckoutForm, isIyzicoConfigured, type BasketItem, type Buyer, type Address } from '@/lib/iyzico';
import { headers } from 'next/headers';

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
      totalPrice,
    } = body;

    // Validate required fields
    if (!orderId || !items || !buyerInfo || !shippingAddress || !totalPrice) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    // Get client IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || '127.0.0.1';

    // Format basket items
    const basketItems: BasketItem[] = items.map((item: any) => ({
      id: item.id,
      name: item.title.substring(0, 50), // Max 50 chars
      category1: item.category || 'Porselen',
      category2: item.material || 'El Yapımı',
      itemType: 'PHYSICAL',
      price: parseFloat(item.price.replace(/[^\d.]/g, '')).toFixed(2),
    }));

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

    // Calculate total
    const price = parseFloat(totalPrice.replace(/[^\d.]/g, '')).toFixed(2);

    // Get callback URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = headersList.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/api/iyzico/callback`;

    // Initialize checkout form
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
      basketItems,
    });

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        checkoutFormContent: result.checkoutFormContent,
        token: result.token,
        tokenExpireTime: result.tokenExpireTime,
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
