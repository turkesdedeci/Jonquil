import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutFormResult } from '@/lib/iyzico';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Get form data from iyzico callback
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
    }

    // Retrieve payment result from iyzico
    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // Payment successful
      const orderId = result.conversationId;
      const paymentId = result.paymentId;
      const paidPrice = result.paidPrice;

      // Update order in database
      if (supabase && orderId) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'processing',
              payment_status: 'paid',
              payment_id: paymentId,
              payment_method: 'credit_card',
              paid_amount: parseFloat(paidPrice),
              paid_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        } catch (dbError) {
          console.error('Database update error:', dbError);
        }
      }

      // Redirect to success page
      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId);
      successUrl.searchParams.set('paymentId', paymentId);
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed
      const errorMessage = result.errorMessage || 'Ödeme işlemi başarısız';
      const errorCode = result.errorCode || 'unknown';
      const orderId = result.conversationId;

      // Update order status to failed
      if (supabase && orderId) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              payment_status: 'failed',
              payment_error: errorMessage,
            })
            .eq('id', orderId);
        } catch (dbError) {
          console.error('Database update error:', dbError);
        }
      }

      // Redirect to error page
      const errorUrl = new URL('/odeme-hatasi', request.url);
      errorUrl.searchParams.set('error', errorCode);
      errorUrl.searchParams.set('message', encodeURIComponent(errorMessage));
      if (orderId) {
        errorUrl.searchParams.set('orderId', orderId);
      }
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('iyzico callback error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}

// Also handle GET requests (some payment gateways use GET for callbacks)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/odeme-hatasi?error=missing_token', request.url));
  }

  // Process the same way as POST
  try {
    const result = await retrieveCheckoutFormResult(token);

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      const orderId = result.conversationId;
      const paymentId = result.paymentId;

      // Update order if supabase is available
      if (supabase && orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'paid',
            payment_id: paymentId,
          })
          .eq('id', orderId);
      }

      const successUrl = new URL('/siparis-basarili', request.url);
      successUrl.searchParams.set('orderId', orderId);
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/odeme-hatasi', request.url);
      errorUrl.searchParams.set('error', result.errorCode || 'payment_failed');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('iyzico callback GET error:', error);
    return NextResponse.redirect(new URL('/odeme-hatasi?error=server_error', request.url));
  }
}
