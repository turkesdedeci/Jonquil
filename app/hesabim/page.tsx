'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile } from '@clerk/nextjs';
import { AdreslerimTab } from '@/components/AdreslerimTab';
import { SiparislerimTab } from '@/components/SiparislerimTab';
import { FavorilerimTab } from '@/components/FavorilerimTab';
import { Heart, MapPin, Package, User } from 'lucide-react';

type TabType = 'profil' | 'adreslerim' | 'siparislerim' | 'favorilerim';

function HesabimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { id: 'profil' as TabType, label: 'Profil', icon: User },
    { id: 'adreslerim' as TabType, label: 'Adreslerim', icon: MapPin },
    { id: 'siparislerim' as TabType, label: 'Siparişlerim', icon: Package },
    { id: 'favorilerim' as TabType, label: 'Favorilerim', icon: Heart },
  ];

  const requestedTab = searchParams.get('tab');
  const activeTab: TabType = tabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab as TabType)
    : 'profil';

  const handleTabChange = (tab: TabType) => {
    router.replace(`/hesabim?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-4xl font-light text-[#1a1a1a]">Hesabım</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#faf8f5]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </button>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 border-b border-[#e8e6e3]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0f3f44] text-[#0f3f44]'
                      : 'border-transparent text-[#666] hover:text-[#1a1a1a]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 shadow-lg">
          {activeTab === 'profil' && (
            <UserProfile
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-none',
                  navbar: 'hidden',
                  headerTitle: 'font-serif text-2xl',
                  headerSubtitle: 'text-[#666]',
                  formButtonPrimary: 'bg-[#0f3f44] hover:bg-[#0a2a2e]',
                  formFieldInput: 'border-[#e8e6e3] focus:border-[#0f3f44]',
                  identityPreviewEditButton: 'text-[#0f3f44]',
                  badge: 'bg-[#0f3f44]',
                },
              }}
            />
          )}

          {activeTab === 'adreslerim' && <AdreslerimTab />}
          {activeTab === 'siparislerim' && <SiparislerimTab />}
          {activeTab === 'favorilerim' && <FavorilerimTab />}
        </div>
      </div>
    </div>
  );
}

export default function HesabimPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44]" />
            <p className="text-[#666]">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <HesabimContent />
    </Suspense>
  );
}
