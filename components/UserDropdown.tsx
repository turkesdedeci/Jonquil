'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@/hooks/useClerkUser';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Package, 
  Heart, 
  Settings, 
  LogOut,
  ChevronDown 
} from 'lucide-react';

export function UserDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;
  const emailAddress = user.primaryEmailAddress?.emailAddress;
  const fallbackInitial = emailAddress ? emailAddress[0].toUpperCase() : '?';
  const userInitial = user.firstName?.[0] || fallbackInitial;

  const menuItems = [
    {
      icon: User,
      label: 'Profil',
      onClick: () => {
        window.location.href = '/hesabim?tab=profil';
        setIsOpen(false);
      }
    },
    {
      icon: MapPin,
      label: 'Adreslerim',
      onClick: () => {
        window.location.href = '/hesabim?tab=adreslerim';
        setIsOpen(false);
      }
    },
    {
      icon: Package,
      label: 'Siparişlerim',
      onClick: () => {
        window.location.href = '/hesabim?tab=siparislerim';
        setIsOpen(false);
      }
    },
    {
      icon: Heart,
      label: 'Favorilerim',
      onClick: () => {
        window.location.href = '/hesabim?tab=favorilerim';
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Hesap Ayarları',
      onClick: () => {
        window.location.href = '/hesabim?tab=profil';
        setIsOpen(false);
      }
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full transition-all hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0f3f44] bg-[#0f3f44] text-white font-semibold">
          {userInitial}
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-[#1a1a1a] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-2xl"
            >
              {/* User Info Header */}
              <div className="border-b border-[#e8e6e3] bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e] p-4 text-white">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold backdrop-blur-sm">
                    {userInitial}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="truncate text-xs text-white/80">
                      {emailAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#1a1a1a] transition-colors hover:bg-[#faf8f5]"
                    >
                      <Icon className="h-5 w-5 text-[#0f3f44]" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-[#e8e6e3]" />

              {/* Sign Out */}
              <div className="p-2">
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Çıkış Yap</span>
                </button>
              </div>

              {/* Clerk Badge */}
              <div className="border-t border-[#e8e6e3] bg-[#faf8f5] px-4 py-2 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-[#666]">
                  <span>Secured by</span>
                  <svg viewBox="0 0 40 40" className="h-4 w-4">
                    <path d="M20 0L0 8v12c0 12.15 8.42 23.5 20 32 11.58-8.5 20-19.85 20-32V8L20 0z" fill="#6C47FF"/>
                  </svg>
                  <span className="font-semibold">Clerk</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
