'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function OdemeHatasiContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const getErrorMessage = () => {
    if (errorMessage) {
      return decodeURIComponent(errorMessage);
    }

    switch (errorCode) {
      case 'missing_token':
        return 'Ödeme bilgileri eksik veya geçersiz.';
      case 'server_error':
        return 'Sunucu hatası oluştu. Lütfen tekrar deneyin.';
      case 'payment_failed':
        return 'Ödeme işlemi başarısız oldu.';
      case 'card_declined':
        return 'Kartınız reddedildi. Lütfen farklı bir kart deneyin.';
      case 'insufficient_funds':
        return 'Yetersiz bakiye. Lütfen bakiyenizi kontrol edin.';
      default:
        return 'Ödeme işlemi sırasında bir hata oluştu.';
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="mb-4 text-2xl font-semibold text-neutral-900">
          Ödeme Başarısız
        </h1>

        <p className="mb-6 text-neutral-600">
          {getErrorMessage()}
        </p>

        {orderId && (
          <p className="mb-6 text-sm text-neutral-500">
            Sipariş No: {orderId}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/odeme"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e]"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-4">
          <p className="text-sm text-neutral-600">
            Sorun devam ederse lütfen bizimle iletişime geçin:
          </p>
          <p className="mt-2">
            <a
              href="mailto:info@jonquil.com"
              className="text-sm font-medium text-[#0f3f44] hover:underline"
            >
              info@jonquil.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OdemeHatasiPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 h-20 w-20 animate-pulse rounded-full bg-neutral-200" />
          <p className="text-neutral-500">Yükleniyor...</p>
        </div>
      </main>
    }>
      <OdemeHatasiContent />
    </Suspense>
  );
}
