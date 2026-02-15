'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'jonquil-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez kullanımı bildirimi"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e6e3] bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm text-[#555]">
          Bu site, deneyiminizi iyileştirmek amacıyla çerezler kullanmaktadır.{' '}
          <Link href="/kvkk" className="underline hover:text-[#0f3f44]">
            KVKK Aydınlatma Metni
          </Link>{' '}
          ve{' '}
          <Link href="/gizlilik" className="underline hover:text-[#0f3f44]">
            Gizlilik Politikası
          </Link>
          &apos;nı inceleyebilirsiniz.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={reject}
            className="rounded-full border border-[#ccc] px-5 py-2 text-sm text-[#555] transition-colors hover:border-[#0f3f44] hover:text-[#0f3f44]"
          >
            Reddet
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-[#0f3f44] px-5 py-2 text-sm text-white transition-colors hover:bg-[#1a5c63]"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
