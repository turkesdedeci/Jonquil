import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, Phone, MapPin, Clock, Building2, FileText } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim - JONQUIL STUDIO",
  description: "JONQUIL STUDIO iletişim bilgileri ve şirket bilgileri",
};

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        İletişim
      </h1>
      <p className="mt-4 text-neutral-600">
        Sorularınız, önerileriniz veya siparişleriniz hakkında bizimle iletişime geçebilirsiniz.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* İletişim Bilgileri */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-900">İletişim Bilgileri</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Mail className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">E-posta</h3>
                <a href="mailto:fulyaozzturk@gmail.com" className="text-[#0f3f44] hover:underline">
                  fulyaozzturk@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Phone className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Telefon</h3>
                <a href="tel:+905335101093" className="text-[#0f3f44] hover:underline">
                  0 (533) 510 10 93
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <MapPin className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Adres</h3>
                <p className="text-neutral-600">
                  Kazım Özalp Mah. Kumkapı Sok. 31/4<br />
                  Çankaya / Ankara
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Clock className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Çalışma Saatleri</h3>
                <p className="text-neutral-600">
                  Pazartesi - Cuma: 09:00 - 18:00<br />
                  Cumartesi: 10:00 - 14:00<br />
                  Pazar: Kapalı
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Şirket Bilgileri */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-900">Şirket Bilgileri</h2>

          <div className="rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-6">
            <div className="mb-4 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-[#0f3f44]" />
              <span className="font-semibold text-neutral-900">Resmi Bilgiler</span>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Ticaret Unvanı</dt>
                <dd className="text-neutral-900">JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ</dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Vergi Dairesi / No</dt>
                <dd className="text-neutral-900">Cumhuriyet Vergi Dairesi / 484 212 2134</dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Merkez Adresi</dt>
                <dd className="text-neutral-900">
                  Kazım Özalp Mah. Kumkapı Sok. 31/4<br />
                  Çankaya / Ankara
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Yetkili Kişi</dt>
                <dd className="text-neutral-900">Fulya Öztürk</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[#e8e6e3] bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#0f3f44]" />
              <span className="font-semibold text-neutral-900">Yasal Bilgiler</span>
            </div>

            <ul className="space-y-2 text-sm">
              <li>
                <a href="/mesafeli-satis-sozlesmesi" className="text-[#0f3f44] hover:underline">
                  Mesafeli Satış Sözleşmesi
                </a>
              </li>
              <li>
                <a href="/on-bilgilendirme-formu" className="text-[#0f3f44] hover:underline">
                  Ön Bilgilendirme Formu
                </a>
              </li>
              <li>
                <a href="/uyelik-sozlesmesi" className="text-[#0f3f44] hover:underline">
                  Üyelik Sözleşmesi
                </a>
              </li>
              <li>
                <a href="/kisisel-veriler-politikasi" className="text-[#0f3f44] hover:underline">
                  Kişisel Veriler Politikası (KVKK)
                </a>
              </li>
              <li>
                <a href="/gizlilik-guvenlik-politikasi" className="text-[#0f3f44] hover:underline">
                  Gizlilik ve Güvenlik Politikası
                </a>
              </li>
              <li>
                <a href="/iptal-iade-proseduru" className="text-[#0f3f44] hover:underline">
                  İptal ve İade Prosedürü
                </a>
              </li>
              <li>
                <a href="/teslimat-iade" className="text-[#0f3f44] hover:underline">
                  Teslimat ve İade Koşulları
                </a>
              </li>
              <li>
                <a href="/gizlilik-politikasi" className="text-[#0f3f44] hover:underline">
                  Gizlilik Politikası
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* İletişim Formu */}
      <div className="mt-12">
        <h2 className="mb-6 text-lg font-semibold text-neutral-900">Bize Yazın</h2>
        <Suspense fallback={<div className="rounded-xl border border-[#e8e6e3] bg-white p-6 text-sm text-neutral-500">Form yükleniyor...</div>}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
