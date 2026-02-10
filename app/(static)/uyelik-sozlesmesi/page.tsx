import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi - JONQUIL STUDIO",
  description: "JONQUIL STUDIO üyelik sözleşmesi",
};

export default function UyelikSozlesmesiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Üyelik Sözleşmesi
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">1. TARAFLAR</h2>
          <p>
            İşbu sözleşme, JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ (“SATICI”) ile siteye üye olan kullanıcı
            (“ÜYE”) arasında düzenlenmiştir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">2. KONU</h2>
          <p>
            Bu sözleşme, sitenin kullanım koşullarını, üyelik hizmetlerinden yararlanma şartlarını ve
            tarafların hak/yükümlülüklerini belirler.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">3. ÜYELİK KOŞULLARI</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>ÜYE, siteye üye olurken verdiği bilgilerin doğru olduğunu kabul eder.</li>
            <li>ÜYE, hesap bilgilerini gizli tutmakla yükümlüdür.</li>
            <li>SATICI, gerekli gördüğü hallerde üyeliği askıya alabilir veya sona erdirebilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">4. HAK VE YÜKÜMLÜLÜKLER</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>ÜYE, siteyi hukuka ve ahlaka uygun şekilde kullanacağını kabul eder.</li>
            <li>ÜYE, site içeriğini izinsiz kopyalayamaz, çoğaltamaz veya kullanamaz.</li>
            <li>SATICI, teknik nedenlerle geçici erişim kesintisi yapabilir.</li>
            <li>ÜYE, yürürlükteki mevzuata aykırı davranışlardan doğan sorumluluğun kendisine ait olduğunu kabul eder.</li>
            <li>ÜYE, site üzerinde tersine mühendislik yapmayacağını kabul eder.</li>
            <li>Üyelerin üçüncü kişilerle ilişkileri kendi sorumluluğundadır.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">5. KİŞİSEL VERİLER</h2>
          <p>
            ÜYE’ye ait kişisel veriler, Kişisel Veriler Politikası ve KVKK Aydınlatma metinlerinde belirtilen
            amaçlarla işlenir ve korunur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">6. FİKRİ MÜLKİYET</h2>
          <p>
            Site içeriğine ilişkin tüm haklar SATICI’ya aittir. ÜYE, içerikleri izinsiz kullanamaz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">7. SORUMLULUK SINIRLAMASI</h2>
          <p>
            SATICI, siteye erişim ve kullanım sırasında doğabilecek dolaylı zararlar ile üçüncü taraf
            hizmetlerinden kaynaklanan kesintilerden sorumlu değildir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">8. MÜCBİR SEBEP</h2>
          <p>
            Mücbir sebep hallerinde tarafların yükümlülükleri, engel ortadan kalkana kadar askıya alınabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">9. DEĞİŞİKLİKLER</h2>
          <p>
            SATICI, site içeriği ve sözleşme koşullarında değişiklik yapabilir. Güncellemeler
            yayımlandığı tarihten itibaren geçerli olur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">10. TEBLİGAT VE DELİL</h2>
          <p>
            Bildirimler, üyelik sırasında bildirilen e-posta adresi üzerinden yapılır. SATICI kayıtları,
            uyuşmazlıklarda delil niteliğindedir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">11. YETKİLİ MAHKEME</h2>
          <p>
            Uyuşmazlıklarda tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">12. YÜRÜRLÜK</h2>
          <p>
            ÜYE, bu sözleşmeyi onaylamakla tüm koşulları okuduğunu, anladığını ve kabul ettiğini beyan eder.
          </p>
        </section>
      </div>
    </div>
  );
}
