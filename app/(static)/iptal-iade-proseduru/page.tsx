import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İptal ve İade Prosedürü - JONQUIL STUDIO",
  description: "JONQUIL STUDIO iptal ve iade prosedürü",
};

export default function IptalIadeProseduruPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        İptal ve İade Prosedürü
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">1. Genel</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Sipariş, yasal süreleri aşmamak kaydıyla ilan edilen süre içinde teslim edilir.</li>
            <li>İmkânsızlık halinde ALICI makul sürede bilgilendirilir ve bedel iade edilir.</li>
            <li>Ürün bedeli ödenmez veya ödeme iptal edilirse teslim yükümlülüğü sona erer.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">2. İptal</h2>
          <p>
            Sipariş iptali talebinizi <strong>fulyaozzturk@gmail.com</strong> adresine iletebilirsiniz.
            Sipariş kargoya verilmeden önce iptal işlemi yapılabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">3. Cayma Hakkı</h2>
          <p>
            Cayma hakkı kapsamında iade talepleri, teslim tarihinden itibaren 14 gün içinde
            yapılmalıdır. Ürünlerin kullanılmamış ve tekrar satılabilir durumda olması beklenir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">4. İade Süreci</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>İade talebinizi e-posta ile bildiriniz.</li>
            <li>Ürün, faturası ile birlikte gönderilmelidir.</li>
            <li>Ürünün iadesi, cayma bildirimi tarihinden itibaren makul süre içinde yapılmalıdır.</li>
            <li>İade onayı sonrası ücret, ödeme yöntemine göre iade edilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">5. İade Koşulları</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Ürün kutusu/ambalajı, varsa aksesuarları ile birlikte eksiksiz olmalıdır.</li>
            <li>İade kargo bedeli aksi belirtilmedikçe ALICI’ya aittir.</li>
            <li>Bedel iadesi, mevzuata uygun süre içinde yapılır.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">6. Cayma Hakkı Kullanılamayacak Ürünler</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Kişiye özel hazırlanan veya kişisel ihtiyaçlara göre üretilen ürünler</li>
            <li>Ambalajı açılmış ve iadesi hijyen açısından uygun olmayan ürünler</li>
            <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">7. Yetkisiz Ödeme Bildirimi</h2>
          <p>
            Kart sahibinin izni dışında ödeme yapılması halinde banka ile yapılan başvuru sonucuna göre
            işlem gerçekleştirilir. Teslim edilmiş ürünlerin iadesi istenebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">8. Teslimatta Kontrol</h2>
          <p>
            Ürün tesliminde hasar tespiti halinde, kargo görevlisine tutanak tutturulması önerilir.
          </p>
        </section>
      </div>
    </div>
  );
}
