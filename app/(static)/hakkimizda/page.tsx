import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Award, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda - JONQUIL STUDIO",
  description: "JONQUIL STUDIO - Premium tasarım porselen ve objeleri. Hikayemiz ve değerlerimiz.",
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Hakkımızda</h1>

      <div className="mt-12 space-y-12 text-[15px] leading-7 text-neutral-600">
        <section>
          <p className="text-lg leading-8">
            <strong className="text-neutral-900">Jonquil Studio</strong>, gündelik ritüellerin etrafında şekillenen
            porselen ve tasarım objeleri üretir. Her parça; sofrada, yaşam alanında ve zamanla kurulan
            ilişkide kalıcı olmayı hedefler. Markanın çıkış noktası, objenin yalnızca işlevini değil,
            kullanıldığı anı da düşünmektir.
          </p>
        </section>

        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-neutral-100 shadow-lg">
          <Image
            src="/images/footerslayt/Jonquil foto galeri-ottoman seri (3).jpg"
            alt="Jonquil Studio Atölye"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <Award className="h-6 w-6 text-[#0f3f44]" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">Kalite</h3>
            <p className="text-sm">
              En kaliteli malzemeler ve özenli üretim süreciyle her parça özel olarak üretilir.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <Sparkles className="h-6 w-6 text-[#0f3f44]" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">Ustalık ve Detay</h3>
            <p className="text-sm">
              Her ürün usta ellerde şekillenir; altın detaylar tek tek işlenir.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <Building2 className="h-6 w-6 text-[#0f3f44]" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">Zamansızlık</h3>
            <p className="text-sm">
              Trendleri değil, zamansız tasarımları takip ederiz. Her parça nesiller boyu kullanılmak üzere tasarlanır.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Tasarım Felsefemiz</h2>
          <p>
            Koleksiyonlarımız; güçlü desenler, dengeli renk kullanımı ve net formlar üzerinden ilerler.
            Dekoratif olmaktan çok yaşayan, trendlerden çok zamansız bir dil benimser.
          </p>
          <p className="mt-4">
            Üretim sürecinde kalite, tutarlılık ve detay önceliklidir. Porselenin karakteri korunur;
            altın detaylar, renkler ve yüzeyler göze batmadan var olur. Jonquil&apos;de lüks, gösterişli
            olmaktan değil, tutarlılıktan doğar.
          </p>
        </section>

        <section className="rounded-3xl border border-[#e8e6e3] bg-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Müşteriye Özel Çalışmalar</h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                Özel sipariş, markaya özel hediye koleksiyonu veya davet sofrası projelerimizin örneklerini
                ayrı sayfada inceleyebilirsiniz.
              </p>
            </div>
            <span className="hidden rounded-full border border-[#d8d2c6] bg-[#faf8f5] px-3 py-1 text-xs font-medium text-[#0f3f44] md:inline-flex">
              Özel Üretim
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/ozel-calismalar"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f3f44] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2f34]"
            >
              Özel Çalışmaları Gör
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c6] bg-[#faf8f5] px-5 py-2.5 text-sm font-semibold text-[#0f3f44] transition-colors hover:bg-[#f2eee7]"
            >
              Proje Talebi Oluştur
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-8">
          <h2 className="mb-6 text-xl font-semibold text-neutral-900">Şirket Bilgileri</h2>

          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Ticaret Unvanı</dt>
              <dd className="mt-1 text-neutral-900">JONQUIL TASARIM TİCARET LİMİTED ŞİRKETİ</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-500">MERSİS No</dt>
              <dd className="mt-1 text-neutral-900">0484212213400001</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-500">Vergi Dairesi / No</dt>
              <dd className="mt-1 text-neutral-900">Cumhuriyet Vergi Dairesi / 484 212 2134</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-500">KEP Adresi</dt>
              <dd className="mt-1 text-neutral-900">-</dd>
            </div>

            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-neutral-500">Merkez Adresi</dt>
              <dd className="mt-1 text-neutral-900">Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-500">E-posta</dt>
              <dd className="mt-1">
                <a href="mailto:info@jonquilstudio.co" className="text-[#0f3f44] hover:underline">
                  info@jonquilstudio.co
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-500">Telefon</dt>
              <dd className="mt-1">
                <a href="tel:+905335101093" className="text-[#0f3f44] hover:underline">
                  0 (533) 510 10 93
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}