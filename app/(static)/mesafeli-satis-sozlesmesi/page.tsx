import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi - JONQUIL STUDIO",
  description: "JONQUIL STUDIO mesafeli satış sözleşmesi ve satış koşulları",
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Mesafeli Satış Sözleşmesi
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 1 - TARAFLAR</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-neutral-800">1.1. SATICI</h3>
              <ul className="mt-2 space-y-1 pl-4">
                <li><strong>Unvan:</strong> JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ</li>
                <li><strong>Adres:</strong> Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara</li>
                <li><strong>Telefon:</strong> 0 (533) 510 10 93</li>
                <li><strong>E-posta:</strong> fulyaozzturk@gmail.com</li>
                <li><strong>Vergi Dairesi / No:</strong> Cumhuriyet Vergi Dairesi / 484 212 2134</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">1.2. ALICI</h3>
              <p className="mt-2">
                İşbu sözleşmeyi onaylayan ve siparişi veren gerçek/tüzel kişidir. Alıcı bilgileri
                sipariş sırasında beyan edilen verilerden oluşur.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 2 - TANIMLAR</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Kanun:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun</li>
            <li><strong>Yönetmelik:</strong> Mesafeli Sözleşmeler Yönetmeliği</li>
            <li><strong>Site:</strong> SATICI’ya ait internet sitesi</li>
            <li><strong>Mal/Hizmet:</strong> Site üzerinden sunulan ürün veya hizmet</li>
            <li><strong>Sözleşme:</strong> İşbu mesafeli satış sözleşmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 3 - KONU</h2>
          <p>
            İşbu sözleşme, ALICI’nın SATICI’ya ait internet sitesi üzerinden elektronik ortamda
            siparişini verdiği ürünün satışı ve teslimine ilişkin tarafların hak ve yükümlülüklerini
            düzenler.
          </p>
          <p className="mt-3">
            Sitede ilan edilen fiyatlar satış fiyatıdır; güncelleme yapılana kadar geçerlidir.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 4 - SATICI BİLGİLERİ</h2>
          <ul className="mt-2 space-y-1 pl-4">
            <li><strong>Unvan:</strong> JONQUİL TASARIM TİCARET LİMİTED ŞİRKETİ</li>
            <li><strong>Adres:</strong> Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara</li>
            <li><strong>Telefon:</strong> 0 (533) 510 10 93</li>
            <li><strong>E-posta:</strong> fulyaozzturk@gmail.com</li>
            <li><strong>Vergi Dairesi / No:</strong> Cumhuriyet Vergi Dairesi / 484 212 2134</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 5 - ALICI BİLGİLERİ</h2>
          <ul className="mt-2 space-y-1 pl-4">
            <li><strong>Teslim Edilecek Kişi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Teslimat Adresi:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Telefon:</strong> [Sipariş Bilgisi]</li>
            <li><strong>E-posta:</strong> [Sipariş Bilgisi]</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 6 - SİPARİŞ VEREN KİŞİ BİLGİLERİ</h2>
          <ul className="mt-2 space-y-1 pl-4">
            <li><strong>Ad/Soyad/Unvan:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Adres:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Telefon:</strong> [Sipariş Bilgisi]</li>
            <li><strong>E-posta:</strong> [Sipariş Bilgisi]</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 7 - SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Ürünlerin temel özellikleri (tür, miktar, marka/model, renk vb.) sitede yer alır.</li>
            <li>Vergiler dâhil toplam bedel sipariş özetinde gösterilir.</li>
            <li>Kargo ücreti ve kampanya koşulları varsa ödeme adımında belirtilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 8 - FATURA BİLGİLERİ</h2>
          <ul className="mt-2 space-y-1 pl-4">
            <li><strong>Ad/Soyad/Unvan:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Adres:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Telefon:</strong> [Sipariş Bilgisi]</li>
            <li><strong>E-posta:</strong> [Sipariş Bilgisi]</li>
            <li><strong>Fatura Teslimi:</strong> Fatura, teslimat sırasında ürünle birlikte iletilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 9 - GENEL HÜKÜMLER</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>ALICI, ürünün temel nitelikleri, satış fiyatı, ödeme ve teslimat koşullarını onaylar.</li>
            <li>Teslimat, yasal süreyi aşmamak kaydıyla sitede belirtilen süre içinde yapılır.</li>
            <li>Teslimat masrafları aksi belirtilmedikçe ALICI’ya aittir.</li>
            <li>Ödeme işlemleri için yetkisiz kullanım hallerinde banka hükümleri geçerlidir.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 10 - CAYMA HAKKI</h2>
          <div className="space-y-4">
            <p>
              ALICI, teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir.
            </p>
            <p>
              Cayma bildirimi yazılı olarak (e-posta vb.) yapılmalıdır.
            </p>
            <ul className="list-disc pl-5">
              <li>E-posta: fulyaozzturk@gmail.com</li>
              <li>Adres: Kazım Özalp Mah. Kumkapı Sok. 31/4 Çankaya / Ankara</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 11 - CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Kişiye özel hazırlanan veya kişisel ihtiyaçlara göre üretilen ürünler</li>
            <li>Teslimden sonra ambalajı açılmış ve iadesi hijyen açısından uygun olmayan ürünler</li>
            <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 12 - TEMERRÜT HALİ VE HUKUKİ SONUÇLARI</h2>
          <p>
            ALICI, kredi kartı ile yaptığı ödemelerde temerrüde düşmesi halinde banka ile olan sözleşmesi
            kapsamında sorumludur.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 13 - YETKİLİ MAHKEME</h2>
          <p>
            Uyuşmazlıklarda tüketicinin yerleşim yerindeki tüketici hakem heyeti veya tüketici mahkemeleri
            yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 14 - YÜRÜRLÜK</h2>
          <p>
            ALICI, siparişini onaylayıp ödeme yaptığında işbu sözleşmenin tüm şartlarını kabul etmiş sayılır.
          </p>
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
