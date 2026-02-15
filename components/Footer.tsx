// components/Footer.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { ASSETS, BRAND } from "@/constants/brand";

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e6e3] bg-[#faf8f5]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-6 flex items-center">
              <Image
                src={ASSETS.logo}
                alt={`${BRAND.name} logo`}
                width={500}
                height={122}
                unoptimized
                className="ml-2 h-auto w-[220px] md:ml-4 md:w-[260px]"
              />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#666]">
              El yapımı porselen ve tasarım objeleri ile sofranıza sanat katın.
            </p>
            <div className="flex gap-3" role="list" aria-label="Sosyal medya">
              <a
                href="https://www.instagram.com/jonquilstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
                aria-label="Instagram'da takip et"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="mailto:info@jonquilstudio.co"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
                aria-label="E-posta gönder"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Alışveriş">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Alışveriş</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><Link href="/urunler" className="hover:text-[#0f3f44]">Tüm Ürünler</Link></li>
              <li><Link href="/koleksiyon/aslan" className="hover:text-[#0f3f44]">Aslan Koleksiyonu</Link></li>
              <li><Link href="/koleksiyon/ottoman" className="hover:text-[#0f3f44]">Ottoman Koleksiyonu</Link></li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Kurumsal">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Kurumsal</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li><Link href="/hakkimizda" className="hover:text-[#0f3f44]">Hakkımızda</Link></li>
              <li><Link href="/blog" className="hover:text-[#0f3f44]">Blog</Link></li>
              <li><Link href="/iletisim" className="hover:text-[#0f3f44]">İletişim</Link></li>
              <li><Link href="/on-bilgilendirme-formu" className="hover:text-[#0f3f44]">Ön Bilgilendirme</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[#0f3f44]">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/uyelik-sozlesmesi" className="hover:text-[#0f3f44]">Üyelik Sözleşmesi</Link></li>
              <li><Link href="/kisisel-veriler-politikasi" className="hover:text-[#0f3f44]">Kişisel Veriler (KVKK)</Link></li>
              <li><Link href="/gizlilik-guvenlik-politikasi" className="hover:text-[#0f3f44]">Gizlilik ve Güvenlik</Link></li>
              <li><Link href="/iptal-iade-proseduru" className="hover:text-[#0f3f44]">İptal ve İade Prosedürü</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-[#0f3f44]">Gizlilik Politikası</Link></li>
            </ul>
          </nav>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Yardım</h3>
            <ul className="space-y-3 text-sm text-[#666]" aria-label="Yardım ve iletişim">
              <li><Link href="/siparis-takip" className="hover:text-[#0f3f44]">Sipariş Takip</Link></li>
              <li><Link href="/teslimat-iade" className="hover:text-[#0f3f44]">Teslimat ve İade</Link></li>
              <li><Link href="/iletisim" className="hover:text-[#0f3f44]">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="/iletisim?type=bug" className="hover:text-[#0f3f44]">Sorun Bildir</Link></li>
              <li>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <a href="tel:+905335101093" aria-label="Telefon: 0 533 510 10 93">0 (533) 510 10 93</a>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <a href="mailto:info@jonquilstudio.co" className="hover:text-[#0f3f44]">info@jonquilstudio.co</a>
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
                  <Image
                    src="/images/iyzico_ile_ode_colored.png"
                    alt="iyzico ile öde"
                    width={73}
                    height={20}
                    className="h-5 w-auto"
                  />
                </div>
                {/* Visa */}
                <div className="flex h-8 items-center rounded bg-white px-3 shadow-sm">
                  <Image
                    src="/images/visa-brandmark-blue-1960x622.webp"
                    alt="Visa"
                    width={73}
                    height={20}
                    className="h-5 w-auto"
                  />
                </div>
                {/* Mastercard */}
                <div className="flex h-8 items-center rounded bg-white px-3 shadow-sm">
                  <Image
                    src="/images/ma_symbol_opt_73_3x.png"
                    alt="Mastercard"
                    width={73}
                    height={20}
                    className="h-5 w-auto"
                  />
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
