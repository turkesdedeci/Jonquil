import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kişisel Veriler Politikası - JONQUIL STUDIO",
  description: "JONQUIL STUDIO kişisel veriler politikası ve KVKK aydınlatma",
};

export default function KisiselVerilerPolitikasiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Kişisel Veriler Politikası (KVKK Aydınlatma)
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">1. Veri Sorumlusu</h2>
          <p>
            JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ, KVKK kapsamında veri sorumlusudur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">2. İşlenen Veriler</h2>
          <p>
            Üyelik, sipariş ve iletişim süreçlerinde ad-soyad, iletişim bilgileri, adres ve ödeme
            işlemlerine ilişkin sınırlı veriler işlenebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">3. İşleme Amaçları</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Siparişlerin alınması ve teslimatın sağlanması</li>
            <li>Müşteri hizmetleri ve destek süreçleri</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">4. Aktarım</h2>
          <p>
            Veriler, ödeme altyapısı sağlayıcıları ve lojistik firmaları gibi hizmet sağlayıcılara,
            yalnızca hizmetin gerektirdiği ölçüde aktarılabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">5. Haklarınız</h2>
          <p>
            KVKK’nın 11. maddesi kapsamında kişisel verilerinize ilişkin bilgi talep etme, düzeltme,
            silme ve işlenmesine itiraz etme haklarına sahipsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">6. İletişim</h2>
          <p>
            Taleplerinizi <strong>fulyaozzturk@gmail.com</strong> adresine iletebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
