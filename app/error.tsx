'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">
          Bir Hata Oluştu
        </h1>
        <p className="mb-6 text-gray-600">
          Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </p>
        {error.message && (
          <p className="mb-6 rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-500">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="mb-6 rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-500">
            Hata Kodu: {error.digest}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
