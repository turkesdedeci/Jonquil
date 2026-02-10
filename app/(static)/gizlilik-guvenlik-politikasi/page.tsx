import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik Politikası - JONQUIL STUDIO",
  description: "JONQUIL STUDIO gizlilik ve güvenlik politikası",
};

export default function GizlilikGuvenlikPolitikasiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Gizlilik ve Güvenlik Politikası
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">1. Kişisel Verilerin Toplanması</h2>
          <p>
            Üyelik, sipariş ve iletişim süreçlerinde ad-soyad, iletişim bilgileri ve teslimat gibi
            veriler toplanabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">2. Gizlilik</h2>
          <p>
            Müşteri bilgilerinin gizliliği esastır. Kişisel veriler, Kişisel Veriler Politikası
            kapsamında ve yasal yükümlülükler çerçevesinde işlenir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">3. Güvenlik ve Kart Bilgileri</h2>
          <p>
            Ödeme işlemleri güvenli altyapılar üzerinden gerçekleştirilir. Kart bilgileri sistemimizde
            saklanmaz.
          </p>
          <p className="mt-2">
            Kart bilgilerinin güvenliği için gerekli teknik ve idari önlemler uygulanır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">4. Teknik Önlemler</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Veri erişimleri yetki kontrolü ile sınırlandırılır.</li>
            <li>İletişim kanalları mümkün olan en yüksek güvenlik standartlarında korunur.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">5. Kampanya ve Bilgilendirme</h2>
          <p>
            ÜYE, dilerse kampanya ve bilgilendirme içeriklerini almayı kabul edebilir; bu tercihini
            daha sonra güncelleyebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">6. IP ve Log Kayıtları</h2>
          <p>
            Sistem sorunlarının tespiti ve güvenlik amacıyla IP ve erişim log kayıtları tutulabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">7. Üçüncü Taraf Bağlantılar</h2>
          <p>
            Sitede üçüncü taraf sitelere bağlantılar bulunabilir. Bu sitelerin içerik ve gizlilik
            uygulamalarından SATICI sorumlu değildir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">8. İstisnai Haller</h2>
          <p>
            Resmi mercilerden gelen talepler, yasal yükümlülükler ve kullanıcı güvenliğine ilişkin
            durumlarda bilgi paylaşımı yapılabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">9. E-Posta Güvenliği</h2>
          <p>
            Müşteri hizmetleriyle yapılan e-posta yazışmalarında kart bilgileri paylaşılmamalıdır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">10. Çerezler</h2>
          <p>
            Site deneyimini geliştirmek için çerezler kullanılabilir. Tarayıcı ayarlarınızdan çerez
            kullanımını yönetebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">11. İletişim ve Güncelleme</h2>
          <p>
            Bu politika güncellenebilir. Güncel metin sitede yayımlandığı tarihten itibaren geçerlidir.
            Sorularınız için <strong>fulyaozzturk@gmail.com</strong> adresi üzerinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
