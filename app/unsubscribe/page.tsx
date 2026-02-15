import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import UnsubscribeContent from './UnsubscribeContent';

export const metadata: Metadata = {
  title: 'Abonelikten Çık',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-6 text-center">
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44]" />}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
