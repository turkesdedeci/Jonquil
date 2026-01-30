// components/Footer.tsx
import React from "react";
import { Instagram, Mail } from "lucide-react";
import { BRAND } from "@/constants/brand";

export default function Footer({ onGo }: { onGo: (r: any) => void }) {
  return (
    <footer className="border-t border-[#e8e6e3] bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e]" />
              <div>
                <div className="text-sm font-bold tracking-widest text-[#1a1a1a]">{BRAND.name}</div>
                <div className="text-[10px] font-light tracking-wide text-[#999]">
                  {BRAND.tagline}
                </div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#666]">
              El yapımı porselen ve tasarım objeleri ile sofranıza sanat katın.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Alışveriş</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><a href="#" className="hover:text-[#0f3f44]">Koleksiyonlar</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Yeni Ürünler</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">En Çok Satanlar</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Hediye Setleri</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Kurumsal</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><button onClick={() => onGo({ name: "about" })} className="hover:text-[#0f3f44]">Hakkımızda</button></li>
              <li><button onClick={() => onGo({ name: "contact" })} className="hover:text-[#0f3f44]">İletişim</button></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Satış Noktaları</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Kariyer</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Yardım</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><a href="#" className="hover:text-[#0f3f44]">Sıkça Sorulan Sorular</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Kargo ve İade</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Ödeme Seçenekleri</a></li>
              <li><a href="#" className="hover:text-[#0f3f44]">Gizlilik Politikası</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e8e6e3] pt-8 text-center text-sm text-[#999]">
          <p>© 2024 Jonquil. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}