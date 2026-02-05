// components/Footer.tsx
import React from "react";
import Image from "next/image";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
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
                href="https://instagram.com/jonquil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@jonquil.com"
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
              <li><button onClick={() => onGo({ name: "urunler" })} className="hover:text-[#0f3f44]">Tüm Ürünler</button></li>
              <li><button onClick={() => onGo({ name: "collection", slug: "aslan" })} className="hover:text-[#0f3f44]">Aslan Koleksiyonu</button></li>
              <li><button onClick={() => onGo({ name: "collection", slug: "ottoman" })} className="hover:text-[#0f3f44]">Ottoman Koleksiyonu</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Kurumsal</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><button onClick={() => onGo({ name: "about" })} className="hover:text-[#0f3f44]">Hakkımızda</button></li>
              <li><a href="/iletisim" className="hover:text-[#0f3f44]">İletişim</a></li>
              <li><a href="/mesafeli-satis-sozlesmesi" className="hover:text-[#0f3f44]">Mesafeli Satış Sözleşmesi</a></li>
              <li><a href="/gizlilik-politikasi" className="hover:text-[#0f3f44]">Gizlilik Politikası</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Yardım</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><a href="/siparis-takip" className="hover:text-[#0f3f44]">Sipariş Takip</a></li>
              <li><a href="/teslimat-iade" className="hover:text-[#0f3f44]">Teslimat ve İade</a></li>
              <li><a href="/iletisim" className="hover:text-[#0f3f44]">Sıkça Sorulan Sorular</a></li>
              <li>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+90 (500) 123 45 67</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:info@jonquil.com" className="hover:text-[#0f3f44]">info@jonquil.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-12 border-t border-[#e8e6e3] pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#999]">Güvenli Ödeme:</span>
              <div className="flex items-center gap-3">
                {/* iyzico Logo */}
                <div className="flex h-8 items-center rounded bg-white px-3 shadow-sm">
                  <span className="text-sm font-bold text-[#1a1a1a]">iyzico</span>
                </div>
                {/* Visa */}
                <div className="flex h-8 items-center rounded bg-white px-3 shadow-sm">
                  <span className="text-sm font-bold text-[#1a1f71]">VISA</span>
                </div>
                {/* Mastercard */}
                <div className="flex h-8 items-center rounded bg-white px-3 shadow-sm">
                  <span className="text-sm font-bold text-[#eb001b]">Master</span>
                  <span className="text-sm font-bold text-[#f79e1b]">card</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#999]">
              © {new Date().getFullYear()} Jonquil Studio. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}