import crypto from 'crypto';

// iyzico Configuration
const config = {
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
};

// Generate Authorization Header
function generateAuthHeader(uri: string, body: string): string {
  const randomKey = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now().toString();

  const hashString = config.apiKey + randomKey + config.secretKey + timestamp + body;
  const hash = crypto.createHash('sha1').update(hashString).digest('base64');

  return `IYZWS ${config.apiKey}:${hash}`;
}

// Generate PKI String for request
function generatePkiString(obj: Record<string, any>, prefix = ''): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      const arrayParts = value.map((item, index) => {
        if (typeof item === 'object') {
          return generatePkiString(item, '');
        }
        return item.toString();
      });
      parts.push(`${key}=[${arrayParts.join(', ')}]`);
    } else if (typeof value === 'object') {
      parts.push(`${key}=[${generatePkiString(value, '')}]`);
    } else {
      parts.push(`${key}=${value}`);
    }
  }

  return parts.join(',');
}

// Make request to iyzico API
async function makeRequest(endpoint: string, data: Record<string, any>): Promise<any> {
  const url = `${config.baseUrl}${endpoint}`;
  const body = JSON.stringify(data);
  const authorization = generateAuthHeader(endpoint, body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'x-iyzi-rnd': crypto.randomBytes(8).toString('hex'),
    },
    body,
  });

  return response.json();
}

// Types
export interface BasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: 'PHYSICAL' | 'VIRTUAL';
  price: string;
}

export interface Buyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  ip: string;
  gsmNumber?: string;
}

export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface PaymentRequest {
  locale?: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: 'TRY' | 'USD' | 'EUR';
  basketId: string;
  paymentGroup?: 'PRODUCT' | 'LISTING' | 'SUBSCRIPTION';
  callbackUrl: string;
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
  enabledInstallments?: number[];
}

export interface CheckoutFormInitializeRequest extends PaymentRequest {
  // Additional fields for checkout form
}

// Initialize Checkout Form (3D Secure)
export async function initializeCheckoutForm(request: CheckoutFormInitializeRequest): Promise<any> {
  const data = {
    locale: request.locale || 'tr',
    conversationId: request.conversationId,
    price: request.price,
    paidPrice: request.paidPrice,
    currency: request.currency || 'TRY',
    basketId: request.basketId,
    paymentGroup: request.paymentGroup || 'PRODUCT',
    callbackUrl: request.callbackUrl,
    enabledInstallments: request.enabledInstallments || [1, 2, 3, 6, 9, 12],
    buyer: {
      id: request.buyer.id,
      name: request.buyer.name,
      surname: request.buyer.surname,
      gsmNumber: request.buyer.gsmNumber || '+905000000000',
      email: request.buyer.email,
      identityNumber: request.buyer.identityNumber,
      registrationAddress: request.buyer.registrationAddress,
      ip: request.buyer.ip,
      city: request.buyer.city,
      country: request.buyer.country,
    },
    shippingAddress: {
      contactName: request.shippingAddress.contactName,
      city: request.shippingAddress.city,
      country: request.shippingAddress.country,
      address: request.shippingAddress.address,
      zipCode: request.shippingAddress.zipCode || '34000',
    },
    billingAddress: {
      contactName: request.billingAddress.contactName,
      city: request.billingAddress.city,
      country: request.billingAddress.country,
      address: request.billingAddress.address,
      zipCode: request.billingAddress.zipCode || '34000',
    },
    basketItems: request.basketItems.map(item => ({
      id: item.id,
      name: item.name,
      category1: item.category1,
      category2: item.category2 || 'Porselen',
      itemType: item.itemType,
      price: item.price,
    })),
  };

  return makeRequest('/payment/iyzipos/checkoutform/initialize/auth/ecom', data);
}

// Retrieve Checkout Form Result
export async function retrieveCheckoutFormResult(token: string): Promise<any> {
  const data = {
    locale: 'tr',
    token,
  };

  return makeRequest('/payment/iyzipos/checkoutform/auth/ecom/detail', data);
}

// Simple Payment (Non-3D)
export async function createPayment(request: PaymentRequest & {
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
}): Promise<any> {
  const data = {
    locale: request.locale || 'tr',
    conversationId: request.conversationId,
    price: request.price,
    paidPrice: request.paidPrice,
    currency: request.currency || 'TRY',
    installment: 1,
    basketId: request.basketId,
    paymentChannel: 'WEB',
    paymentGroup: request.paymentGroup || 'PRODUCT',
    paymentCard: {
      cardHolderName: request.paymentCard.cardHolderName,
      cardNumber: request.paymentCard.cardNumber,
      expireMonth: request.paymentCard.expireMonth,
      expireYear: request.paymentCard.expireYear,
      cvc: request.paymentCard.cvc,
      registerCard: 0,
    },
    buyer: request.buyer,
    shippingAddress: request.shippingAddress,
    billingAddress: request.billingAddress,
    basketItems: request.basketItems,
  };

  return makeRequest('/payment/auth', data);
}

// Check if iyzico is configured
export function isIyzicoConfigured(): boolean {
  return !!(config.apiKey && config.secretKey);
}

export { config as iyzicoConfig };
