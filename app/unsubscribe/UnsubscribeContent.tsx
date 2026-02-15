'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  if (success) {
    return (
      <>
        <div className="mb-6 inline-flex rounded-full bg-green-100 p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mb-3 font-serif text-3xl font-light text-[#1a1a1a]">
          Aboneliğiniz İptal Edildi
        </h1>
        <p className="mb-8 max-w-sm text-[#666]">
          E-posta listemizden başarıyla çıkarıldınız.
        </p>
        <Link
          href="/"
          className="rounded-full bg-[#0f3f44] px-8 py-3 text-sm font-medium tracking-wider text-white transition-colors hover:bg-[#1a5c63]"
        >
          Ana Sayfaya Dön
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 inline-flex rounded-full bg-red-100 p-4">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="mb-3 font-serif text-3xl font-light text-[#1a1a1a]">
        Bir Sorun Oluştu
      </h1>
      <p className="mb-8 max-w-sm text-[#666]">
        {error === 'invalid'
          ? 'Geçersiz veya süresi dolmuş bağlantı.'
          : 'Abonelik iptali gerçekleştirilemedi. Lütfen tekrar deneyin.'}
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#0f3f44] px-8 py-3 text-sm font-medium tracking-wider text-white transition-colors hover:bg-[#1a5c63]"
      >
        Ana Sayfaya Dön
      </Link>
    </>
  );
}
