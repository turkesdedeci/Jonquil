import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu - JONQUIL STUDIO",
  description: "JONQUIL STUDIO ön bilgilendirme formu",
};

export default function OnBilgilendirmeFormuPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Ön Bilgilendirme Formu
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">1. KONU</h2>
          <p>
            Bu ön bilgilendirme formu, siparişe konu ürünlerin satışı ve teslimine ilişkin temel
            koşulları ve tarafların hak-yükümlülüklerini açıklar. Siparişi onaylayan ALICI, ürün bedeli
            ile varsa kargo ve benzeri ek ücretleri ödemeyi kabul eder. Bu form, ilgili mevzuat
            hükümleri kapsamında düzenlenmiştir.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">2. SATICI BİLGİLERİ</h2>
          <ul className="space-y-1 pl-4">
            <li><strong>Unvan:</strong> JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ</li>
            <li><strong>Adres:</strong> Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara</li>
            <li><strong>Telefon:</strong> 0 (533) 510 10 93</li>
            <li><strong>Faks:</strong> -</li>
            <li><strong>E-posta:</strong> fulyaozzturk@gmail.com</li>
            <li><strong>Vergi Dairesi / No:</strong> Cumhuriyet Vergi Dairesi / 484 212 2134</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">3. ALICI BİLGİLERİ</h2>
          <ul className="space-y-1 pl-4">
            <li><strong>Teslim edilecek kişi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Teslimat adresi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Telefon:</strong> [Sipariş Bilgisi]</li>
            <li><strong>E-posta:</strong> [Sipariş Bilgisi]</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">4. ÜRÜN/ÜRÜNLER BİLGİLERİ</h2>
          <p className="mb-3">
            Ürünlerin temel özellikleri, satış fiyatı, vergi dahil toplam bedel ve varsa kargo tutarı
            sipariş özeti ekranında gösterilir.
          </p>
          <ul className="space-y-1 pl-4">
            <li><strong>Ürün tablosu:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Kargo tutarı:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Ödeme şekli:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Teslimat adresi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Fatura adresi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Sipariş tarihi:</strong> [Sipariş Bilgisi]</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">5. GENEL HÜKÜMLER</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>ALICI, ürün nitelikleri, fiyatı, ödeme ve teslimat koşullarını okuduğunu kabul eder.</li>
            <li>Ürün, yasal süreyi aşmamak kaydıyla sipariş sırasında belirtilen süre içinde teslim edilir.</li>
            <li>Yasal azami teslim süresi 30 gündür.</li>
            <li>Ürün bedeli ödenmez veya ödeme iptal edilirse teslim yükümlülüğü sona erer.</li>
            <li>İmkânsızlık halinde SATICI, ALICI’yı bilgilendirir ve bedeli iade eder.</li>
            <li>Yetkisiz kart kullanımı tespiti halinde, teslim edilen ürünün iadesi istenebilir.</li>
          </ul>
        </section>

        <div className="mt-12 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-6">
          <p className="text-sm text-neutral-500">
            Bu form bilgilendirme amaçlıdır. Bağlayıcı koşullar Mesafeli Satış Sözleşmesi ile birlikte
            değerlendirilir.
          </p>
        </div>
      </div>
    </div>
  );
}
