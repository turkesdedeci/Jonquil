import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Building2, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim - JONQUIL STUDIO",
  description: "JONQUIL STUDIO iletişim bilgileri ve şirket bilgileri",
};

export default function IletisimPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-28">
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
                <a href="mailto:info@jonquil.com" className="text-[#0f3f44] hover:underline">
                  info@jonquil.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Phone className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Telefon</h3>
                <a href="tel:+905001234567" className="text-[#0f3f44] hover:underline">
                  +90 (500) 123 45 67
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
                  Örnek Mahallesi, Örnek Sokak No: 1<br />
                  Kadıköy / İstanbul
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
                <dd className="text-neutral-900">JONQUIL STUDIO TİCARET LİMİTED ŞİRKETİ</dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">MERSİS No</dt>
                <dd className="text-neutral-900">0123456789012345</dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Vergi Dairesi / No</dt>
                <dd className="text-neutral-900">Kadıköy V.D. / 1234567890</dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">Merkez Adresi</dt>
                <dd className="text-neutral-900">
                  Örnek Mahallesi, Örnek Sokak No: 1<br />
                  34710 Kadıköy / İstanbul
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="font-medium text-neutral-500">KEP Adresi</dt>
                <dd className="text-neutral-900">jonquil@hs01.kep.tr</dd>
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
                <a href="/gizlilik-politikasi" className="text-[#0f3f44] hover:underline">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="/teslimat-iade" className="text-[#0f3f44] hover:underline">
                  Teslimat ve İade Koşulları
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* İletişim Formu */}
      <div className="mt-12">
        <h2 className="mb-6 text-lg font-semibold text-neutral-900">Bize Yazın</h2>

        <form className="space-y-4 rounded-xl border border-[#e8e6e3] bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
                Adınız Soyadınız
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44]"
                placeholder="Adınız Soyadınız"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44]"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-neutral-700">
              Konu
            </label>
            <select
              id="subject"
              name="subject"
              required
              className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44]"
            >
              <option value="">Konu seçiniz</option>
              <option value="siparis">Sipariş Hakkında</option>
              <option value="iade">İade/Değişim</option>
              <option value="urun">Ürün Bilgisi</option>
              <option value="oneri">Öneri/Şikayet</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-neutral-700">
              Mesajınız
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44]"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e]"
          >
            Gönder
          </button>
        </form>
      </div>
    </main>
  );
}
