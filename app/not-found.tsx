import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  description: 'Aradığınız sayfa mevcut değil.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
      <p className="mb-2 text-sm font-medium tracking-[0.3em] text-[#0f3f44] uppercase">
        404
      </p>
      <h1 className="mb-4 font-serif text-4xl font-light text-[#1a1a1a]">
        Sayfa Bulunamadı
      </h1>
      <p className="mb-8 max-w-md text-[#666]">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#0f3f44] px-8 py-3 text-sm font-medium tracking-wider text-white transition-colors hover:bg-[#1a5c63]"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
