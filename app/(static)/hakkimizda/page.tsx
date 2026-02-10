import Image from "next/image";
import type { Metadata } from "next";
import { Building2, Award, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda - JONQUIL STUDIO",
  description: "JONQUIL STUDIO - Premium el yapımı porselen ve tasarım objeleri. Hikayemiz ve değerlerimiz.",
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Hakkımızda</h1>

      <div className="mt-12 space-y-12 text-[15px] leading-7 text-neutral-600">
        {/* Hikayemiz */}
        <section>
          <p className="text-lg leading-8">
            <strong className="text-neutral-900">Jonquil Studio</strong>, gündelik ritüellerin etrafında şekillenen
            porselen ve tasarım objeleri üretir. Her parça; sofrada, yaşam alanında ve zamanla kurulan
            ilişkide kalıcı olmayı hedefler. Markanın çıkış noktası, objenin yalnızca işlevini değil,
            kullanıldığı anı da düşünmektir.
          </p>
        </section>

        {/* Görsel */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-lg bg-neutral-100">
          <Image
            src="/images/footerslayt/Jonquil foto galeri-ottoman seri (3).jpg"
            alt="Jonquil Studio At?lye"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        {/* Değerlerimiz */}
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
            <h3 className="mb-2 font-semibold text-neutral-900">El İşçiliği</h3>
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

        {/* Tasarım Felsefesi */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Tasarım Felsefemiz</h2>
          <p>
            Koleksiyonlarımız; güçlü desenler, dengeli renk kullanımı ve net formlar üzerinden ilerler.
            Dekoratif olmaktan çok yaşayan, trendlerden çok zamansız bir dil benimser.
          </p>
          <p className="mt-4">
            Üretim sürecinde kalite, tutarlılık ve detay önceliklidir. Porselenin karakteri korunur;
            altın detaylar, renkler ve yüzeyler göze batmadan var olur. Jonquil'de lüks, gösterişli
            olmaktan değil, tutarlılıktan doğar.
          </p>
        </section>

        {/* Şirket Bilgileri */}
        <section className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-8">
          <h2 className="mb-6 text-xl font-semibold text-neutral-900">Şirket Bilgileri</h2>

          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Ticaret Unvanı</dt>
              <dd className="mt-1 text-neutral-900">JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ</dd>
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
              <dd className="mt-1 text-neutral-900">—</dd>
            </div>

            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-neutral-500">Merkez Adresi</dt>
              <dd className="mt-1 text-neutral-900">
                Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara
              </dd>
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
