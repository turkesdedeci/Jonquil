import type { Metadata } from "next";
import { Truck, RotateCcw, Package, AlertCircle, CheckCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Teslimat ve İade - JONQUIL STUDIO",
  description: "JONQUIL STUDIO teslimat koşulları, iade ve değişim politikası",
};

export default function TeslimatIadePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Teslimat ve İade
      </h1>

      <div className="mt-10 space-y-12 text-[15px] leading-7 text-neutral-600">
        {/* Teslimat Bilgileri */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <Truck className="h-6 w-6 text-[#0f3f44]" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Teslimat Bilgileri</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#e8e6e3] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0f3f44]" />
                <h3 className="font-semibold text-neutral-900">Teslimat Süresi</h3>
              </div>
              <p>
                Siparişleriniz, ödemenin onaylanmasının ardından <strong>2-5 iş günü</strong> içerisinde
                kargo firmasına teslim edilir. Teslimat süresi bulunduğunuz bölgeye göre değişiklik gösterebilir.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8e6e3] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#0f3f44]" />
                <h3 className="font-semibold text-neutral-900">Kargo Firması</h3>
              </div>
              <p>
                Siparişleriniz <strong>Yurtiçi Kargo</strong> veya <strong>Aras Kargo</strong> ile
                gönderilmektedir. Kargo takip numaranız e-posta ile tarafınıza iletilecektir.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900">Kargo Ücreti</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>500 TL</strong> ve üzeri siparişlerde kargo <strong>ücretsizdir</strong>.</li>
              <li>500 TL altı siparişlerde kargo ücreti <strong>49,90 TL</strong>'dir.</li>
              <li>Kapıda ödeme seçeneğinde ek <strong>19,90 TL</strong> hizmet bedeli uygulanır.</li>
            </ul>

            <h3 className="mt-6 font-semibold text-neutral-900">Teslimat Bölgeleri</h3>
            <p>
              Şu an için yalnızca <strong>Türkiye</strong> genelinde teslimat yapılmaktadır.
              Yurt dışı gönderimleri için lütfen bizimle iletişime geçin.
            </p>

            <h3 className="mt-6 font-semibold text-neutral-900">Teslimat Adresi</h3>
            <p>
              Siparişiniz, sipariş sırasında belirttiğiniz adrese teslim edilecektir.
              Adres değişikliği için kargo teslim edilmeden önce müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir.
            </p>
          </div>
        </section>

        {/* İade ve Değişim */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <RotateCcw className="h-6 w-6 text-[#0f3f44]" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">İade ve Değişim</h2>
          </div>

          <div className="rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>
14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin iade hakkınız bulunmaktadır. Niteliği ve kanun gereği iade edilemeyecek ürünler hariç, ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900">İade Koşulları</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
              <li>Ürün etiketi ve bandrolü çıkarılmamış olmalıdır</li>
              <li>Ürün faturası iade paketine eklenmelidir</li>
              <li>Ürün hasarsız ve kusursuz durumda olmalıdır</li>
            </ul>

            <h3 className="mt-6 font-semibold text-neutral-900">İade Süreci</h3>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                <strong>İade Talebi:</strong> Hesabınızdaki "Siparişlerim" bölümünden iade talebinde bulunun
                veya <strong>info@jonquilstudio.co</strong> adresine e-posta gönderin.
              </li>
              <li>
                <strong>Onay:</strong> İade talebiniz 1-2 iş günü içinde değerlendirilecek ve
                kargo kodu tarafınıza iletilecektir.
              </li>
              <li>
                <strong>Kargoya Verme:</strong> Ürünü orijinal ambalajında, fatura ile birlikte
                belirtilen kargo firmasına teslim edin.
              </li>
              <li>
                <strong>Kontrol:</strong> Ürün tarafımıza ulaştıktan sonra kontrol edilecektir.
              </li>
              <li>
                <strong>İade:</strong> Ürün onaylandıktan sonra <strong>5-7 iş günü</strong> içinde
                ödeme iade edilecektir.
              </li>
            </ol>

            <h3 className="mt-6 font-semibold text-neutral-900">İade Kargo Ücreti</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Ürün kusuru veya yanlış gönderim durumunda kargo ücreti <strong>bize aittir</strong>.</li>
              <li>Cayma hakkı kullanımında kargo ücreti <strong>müşteriye aittir</strong>.</li>
            </ul>
          </div>
        </section>

        {/* Hasarlı/Eksik Ürün */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">Hasarlı veya Eksik Ürün</h2>
          </div>

          <div className="space-y-4">
            <p>
              Kargo teslimi sırasında paketinizi kontrol ediniz. Hasarlı veya açılmış paket
              teslim almayınız ve kargo görevlisine <strong>tutanak tutturunuz</strong>.
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="mb-3 font-semibold text-amber-800">Hasar Tespit Edildiğinde:</h3>
              <ol className="list-decimal space-y-2 pl-5 text-amber-900">
                <li>Paketi açmadan fotoğraflayın</li>
                <li>Kargo görevlisine tutanak tutturun</li>
                <li>24 saat içinde bize bildirin (info@jonquil.com)</li>
                <li>Fotoğrafları ve tutanak kopyasını e-posta ile gönderin</li>
              </ol>
            </div>

            <p className="mt-4">
              Hasarlı veya eksik ürün bildirimleri <strong>48 saat</strong> içinde yapılmalıdır.
              Tüm hasarlı ürünler ücretsiz olarak değiştirilecektir.
            </p>
          </div>
        </section>

        {/* İade Edilemeyecek Ürünler */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">
            İade Edilemeyecek Ürünler
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Kullanılmış veya hasar görmüş ürünler</li>
            <li>Orijinal ambalajı açılmış veya bozulmuş ürünler</li>
            <li>Kişiye özel sipariş edilen ürünler</li>
            <li>•	niteliği itibarıyla iade edilemeyecek, kullanım sırasında vücutla direkt temasa girmek suretiyle hijyen açısından hassas olan ürünler (gece elbisesi, iç giyim, çorap, mayo ve aksesuarlar v.b.),</li>
          </ul>
        </section>

        {/* İletişim */}
        <section className="rounded-xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Sorularınız mı var?
          </h2>
          <p className="mb-4">
            Teslimat ve iade süreçleri hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <ul className="space-y-2">
            <li>
              <strong>E-posta:</strong>{" "}
              <a href="mailto:info@jonquil.com" className="text-[#0f3f44] hover:underline">
                info@jonquilstudio.co
              </a>
            </li>
            <li>
              <strong>Telefon:</strong> +90 (533) 510 10 93
            </li>
            <li>
              <strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00
            </li>
          </ul>
        </section>

        <div className="mt-12 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-6">
          <p className="text-sm text-neutral-500">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
