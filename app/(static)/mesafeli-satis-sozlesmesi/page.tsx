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
        {/* Madde 1 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 1 - TARAFLAR
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-neutral-800">1.1. SATICI</h3>
              <ul className="mt-2 space-y-1 pl-4">
                <li><strong>Unvan:</strong> JONQUIL STUDIO</li>
                <li><strong>Adres:</strong> [Şirket Adresi]</li>
                <li><strong>Telefon:</strong> +90 (XXX) XXX XX XX</li>
                <li><strong>E-posta:</strong> info@jonquil.com</li>
                <li><strong>MERSİS No:</strong> [XXXXXXXXXXXXXXXX]</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">1.2. ALICI</h3>
              <p className="mt-2">
                İşbu sözleşmeyi kabul ederek sipariş veren gerçek veya tüzel kişidir.
                Alıcı bilgileri sipariş formunda yer almaktadır.
              </p>
            </div>
          </div>
        </section>

        {/* Madde 2 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 2 - KONU
          </h2>
          <p>
            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.jonquil.com internet sitesinden
            elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen
            ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında
            Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve
            yükümlülüklerinin saptanmasıdır.
          </p>
        </section>

        {/* Madde 3 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 3 - SÖZLEŞME KONUSU ÜRÜN
          </h2>
          <p>
            Sözleşme konusu mal veya hizmetin cinsi ve türü, miktarı, marka/modeli, rengi,
            satış bedeli sipariş sayfasında yer almaktadır. Ürünlerin temel özellikleri
            SATICI'ya ait internet sitesinde yer almaktadır.
          </p>
        </section>

        {/* Madde 4 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 4 - GENEL HÜKÜMLER
          </h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              ALICI, SATICI'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri,
              satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi
              olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
            </li>
            <li>
              Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için
              ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler
              içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
            </li>
            <li>
              Sözleşme konusu ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise,
              teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.
            </li>
            <li>
              SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere
              uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.
            </li>
          </ul>
        </section>

        {/* Madde 5 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 5 - TESLİMAT
          </h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Teslimat, stokun müsait olması halinde ve ödemenin gerçekleşmesinden sonra
              en kısa sürede yapılır. Teslimat süresi sipariş onayından itibaren
              <strong> 2-5 iş günü</strong> içerisindedir.
            </li>
            <li>
              Ürün, ALICI'nın sipariş formunda belirttiği adrese teslim edilecektir.
            </li>
            <li>
              Teslimat masrafları ALICI'ya aittir ve ayrıca fatura edilir.
              Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.
            </li>
            <li>
              Teslimat anında ALICI'nın adresinde bulunmaması durumunda dahi SATICI
              edimini tam ve eksiksiz olarak yerine getirmiş olarak kabul edilecektir.
            </li>
          </ul>
        </section>

        {/* Madde 6 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 6 - ÖDEME
          </h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Ödeme, kredi kartı, banka kartı veya havale/EFT ile yapılabilir.
            </li>
            <li>
              Kredi kartı ile yapılan ödemelerde, kart sahibinin izni dışında kart
              bilgilerinin kullanılması halinde SATICI sorumlu tutulamaz.
            </li>
            <li>
              Ödeme işlemleri güvenli ödeme altyapısı sağlayıcısı iyzico aracılığıyla gerçekleştirilir.
            </li>
            <li>
              Taksitli işlemlerde taksit adedi ve aylık ödeme tutarları ödeme sayfasında gösterilir.
            </li>
          </ul>
        </section>

        {/* Madde 7 - CAYMA HAKKI */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 7 - CAYMA HAKKI
          </h2>
          <div className="space-y-4">
            <p>
              ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa
              teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içerisinde cayma hakkını kullanabilir.
            </p>
            <p>
              Cayma hakkının kullanılması için bu süre içinde SATICI'ya yazılı bildirimde
              bulunulması ve ürünün işbu sözleşmede düzenlenen "Cayma Hakkı Kullanılamayacak
              Ürünler" hükümleri çerçevesinde kullanılmamış olması şarttır.
            </p>
            <p>
              Cayma hakkı bildiriminin; e-posta, posta veya faks yoluyla yapılması mümkündür:
            </p>
            <ul className="list-disc pl-5">
              <li>E-posta: info@jonquil.com</li>
              <li>Adres: [Şirket Adresi]</li>
            </ul>
            <p className="mt-4">
              Cayma hakkının kullanılması halinde:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                ALICI'ya veya 3. kişiye teslim edilen ürünün faturası, (İade faturası düzenleyemiyorsanız,
                fatura ile birlikte göndermiş olduğumuz iade formunu doldurarak göndermeniz gerekmektedir.)
              </li>
              <li>İade edilecek ürünlerin kutusu, ambalajı, varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olması,</li>
              <li>İade taşıma bedeli ALICI tarafından karşılanır.</li>
            </ul>
            <p className="mt-4">
              SATICI, cayma bildiriminin kendisine ulaşmasından itibaren en geç <strong>14 gün</strong> içinde
              tahsil edilen toplam bedeli ALICI'ya aynı ödeme yöntemiyle iade eder.
            </p>
          </div>
        </section>

        {/* Madde 8 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 8 - CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER
          </h2>
          <p className="mb-3">
            Aşağıdaki hallerde ALICI cayma hakkını kullanamaz:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Teslimden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış ürünlerde</li>
            <li>ALICI'nın istekleri doğrultusunda veya açıkça kişisel ihtiyaçları için hazırlanan, niteliği itibariyle iade edilemeyen ürünlerde</li>
            <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünlerde</li>
            <li>Teslimden sonra başka ürünlerle karışan ve niteliği itibariyle ayrıştırılması mümkün olmayan ürünlerde</li>
          </ul>
        </section>

        {/* Madde 9 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 9 - TEMERRÜT HALİ VE HUKUKİ SONUÇLAR
          </h2>
          <p>
            ALICI, ödeme işlemlerini kredi kartı ile yaptığı durumda temerrüde düştüğü takdirde,
            kart sahibi banka ile arasındaki kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini
            ve bankaya karşı sorumlu olacağını kabul, beyan ve taahhüt eder.
          </p>
        </section>

        {/* Madde 10 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 10 - YETKİLİ MAHKEME
          </h2>
          <p>
            İşbu sözleşmeden doğan uyuşmazlıklarda şikayet ve itirazlar, aşağıdaki kanunda
            belirtilen parasal sınırlar dahilinde tüketicinin yerleşim yerinin bulunduğu
            veya tüketici işleminin yapıldığı yerdeki tüketici sorunları hakem heyetine
            veya tüketici mahkemesine yapılabilir. Parasal sınıra ilişkin bilgiler aşağıdadır:
          </p>
          <p className="mt-3">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 68. maddesi gereği,
            tüketici hakem heyetlerine başvuru sınırları her yıl güncellenmektedir.
          </p>
        </section>

        {/* Madde 11 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            MADDE 11 - YÜRÜRLÜK
          </h2>
          <p>
            ALICI, işbu sözleşmede yer alan tüm koşulları ve açıklamaları okuduğunu,
            anladığını ve kabul ettiğini, belirtilen iletişim kanallarının
            kendisine ait olduğunu beyan eder. İşbu sözleşme, ALICI tarafından
            elektronik ortamda onaylanmakla yürürlüğe girer.
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
