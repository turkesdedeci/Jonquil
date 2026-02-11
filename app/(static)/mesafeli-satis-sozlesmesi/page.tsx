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
          <p className="mt-3">
            Mesafeli satış sözleşmeleri 6502 sayılı Kanunun 48/1. Maddesinde "satıcı veya sağlayıcı ile tüketicinin eş zamanlı fiziksel varlığı olmaksızın, mal veya hizmetlerin uzaktan pazarlanmasına yönelik olarak oluşturulmuş bir sistem çerçevesinde, taraflar arasında sözleşmenin kurulduğu ana kadar ve kurulduğu an da dâhil olmak üzere uzaktan iletişim araçlarının kullanılması suretiyle kurulan sözleşmelerdir." şeklinde tanımlanmıştır.
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
            <li>Ürünler'in tanımı, birim tutarı, adedi ve ödeme koşullarına ilişkin bilgiler Ön Bilgilendirme Formu’nda/Satış Sözleşmesinde belirtildiği gibidir ve Alıcı tarafından da onaylanmıştır.</li>
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
            <li>ALICI, İnternet Sitesi'nde belirtiği şekilde sözleşme konusu ürünün temel nitelikleri, tüm vergiler dahil satış fiyatı ve ödeme şekli ile teslimatı ve bunun masraflarının ALICI tarafından karşılanacağını, teslimatın gerçekleştirileceği süreye ve SATICI’nın tam ticari unvanı, açık adresi ve iletişim bilgilerine ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
            <li>SATICI, İnternet Sitesi’nin veya mobil uygulamanın ve diğer veriler ile programların kullanılması sebebiyle, sözleşmenin ihlali, haksız fiil, ya da başkaca sebeplere binaen, doğabilecek doğrudan ya da dolaylı hiçbir zarardan sorumlu değildir. SATICI, sözleşmenin ihlali, haksız fiil, ihmal veya diğer sebepler neticesinde; işlemin kesintiye uğraması, hata, ihmal, kesinti, silinme, kayıp, işlemin veya iletişimin gecikmesi, bilgisayar virüsü, telekomünikasyon hatlarında meydana gelen arızalar, iletişim hatası, hırsızlık, imha veya izinsiz olarak kayıtlara girilmesi, değiştirilmesi veya kullanılması hususlarında herhangi bir sorumluluk kabul etmez.</li>
            <li>SATICI, İnternet Sitesi ve/veya Mobil Uygulama’da mevcut her tür hizmet, ürün, kullanma koşulları ile İnternet Sitesi ve/veya Mobil Uygulama’da sunulan bilgileri önceden bir ihtara gerek olmaksızın değiştirme, yeniden organize etme, yayını durdurma hakkını saklı tutar. Değişiklikler İnternet Sitesi’nde ve/veya Mobil Uygulama’da yayın tarihinde yürürlüğe girer. </li>
            <li>SATICI, İnternet Sitesi ve Mobil Uygulama’nın genel görünüm ve tasarımı ile İnternet Sitesi ile Mobil Uygulama’daki tüm bilgi, resim, her türlü marka, İnternet Sitesi alan adı, logo, ikon, demonstratif, yazılı, elektronik, grafik veya makinede okunabilir şekilde sunulan teknik veriler, bilgisayar yazılımları, uygulanan satış sistemi, iş metodu ve iş modeli de dahil tüm materyallerin (“Materyaller”) ve bunlara ilişkin fikri ve sınai mülkiyet haklarının sahibi veya lisans sahibidir ve Materyaller yasal koruma altındadır. İnternet Sitesi ve/veya Mobil Uygulama’da bulunan hiçbir Materyal; önceden izin alınmadan ve kaynak gösterilmeden, kod ve yazılım da dahil olmak üzere, değiştirilemez, kopyalanamaz, çoğaltılamaz, başka bir lisana çevrilemez, yeniden yayımlanamaz, başka bir bilgisayara yüklenemez, postalanamaz, iletilemez, sunulamaz veya dağıtılamaz. İnternet Sitesi ve/veya Mobil Uygulama’nın bütünü veya bir kısmı başka bir internet sitesi veya mobil uygulamada izinsiz olarak kullanılamaz. Aksine herhangi bir durumun tespiti halinde, SATICI’nın hukuki ve cezai sorumluluğa ilişkin ve burada açıkça belirtilmeyen diğer tüm hakları saklıdır.</li>
            <li>ALICI’nın kişisel bilgileri, ancak resmi makamlarca usulü dairesinde bu bilgilerin talep edilmesi halinde ve yürürlükteki emredici mevzuat hükümleri gereğince resmi makamlara açıklama yapmak zorunda olduğu durumlarda resmi makamlara açıklanabilecektir.</li>
            <li>Sözleşme konusu ürün(ler), ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden ve bundan kaynaklanabilecek zararlardan SATICI sorumlu tutulamaz.</li>
            <li>Ürünün(lerin) ALICI’ya gönderimi aşamasında sevkiyat işleminden sorumlu kargo firmasının hata ve ihmallerinden kaynaklı olarak ortaya çıkabilecek zararlardan ve/veya bunların ALICI'ya teslim edilememesinden dolayı SATICI sorumlu tutulamaz. Alıcı, Ürünler'i teslim aldığı anda kontrol etmek ve gördüğü ayıpları derhal Satıcı'ya bildirmekle yükümlüdür.</li>
            <li>SATICI, sözleşme konusu ürünün(lerin) sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.</li>
            <li>SATICI, sipariş konusu ürün veya hizmetin yerine getirilmesinin imkansızlaşması halinde sözleşme konusu yükümlülüklerini yerine getiremezse, bu durumu, sözleşmeden doğan ifa yükümlülüğünün süresi dolmadan ALICI’ya bildirir ve stoklarında bulunması halinde ALICI’ya eşit kalite ve fiyatta farklı bir ürün tedarik edebilir.</li>
            <li>ALICI tarafından satın alınmış ürün ya da hizmetin SATICI’nın hizmet aldığı tedarikçi firma stoklarında olmaması ve eşit kalitede ve fiyatta muadil ürünün de bulunmaması halinde, SATICI’nın ALICI’nın ödemiş olduğu bedeli iade etme hakkı saklıdır.</li>
            <li>ALICI’nın kredi kartı ile yaptığı ödemelerde ise, ürün(ler) tutarı, siparişin ALICI tarafından iptal edilmesinden sonra 14 (on dört) gün içerisinde ilgili bankaya iade edilir. Bu tutarın bankaya iadesinden sonra ALICI hesaplarına yansıması tamamen banka işlem süreci ile ilgili olduğundan, ALICI olası gecikmeler için SATICI'nın herhangi bir şekilde müdahalede bulunmasının mümkün olamayacağını ve SATICI tarafından kredi kartına iade edilen tutarın banka tarafından ALICI hesabına yansıtılmasının ortalama 2 ile 3 haftayı bulabileceğini peşinen kabul etmektedir.</li>
            <li>SATICI, İnternet Sitesi üzerinden ALICI ihtiyacını aşan alımları iptal etme hakkını saklı tutar. ALICI’nın ihtiyacını aşan, toptan nitelikteki alımlarda satın alınanların 3 (üç) adet ürünü aşması halinde SATICI, siparişi tamamen iptal etme ya da perakende alım sınırında kalan yalnızca 3 (üç) adet ürün gönderimini sağlama hakkını saklı tutar.</li>
            <li>Ürün fiyatlarının açık bir hata olduğu ortalama bir kişi tarafından anlaşılacak seviyede piyasa fiyatının çok altında yazılması durumunda, işbu hatalı fiyata göre verilen tüm siparişlerin SATICI tarafından iptal edilme hakkı vardır. ALICI böylesi bir durumda açık bir hata olması nedeniyle hiçbir hak ve talepte bulunmayacağını kabul ve beyan eder.</li>

          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">MADDE 10 - CAYMA HAKKI</h2>
          <div className="space-y-4">
            <p>
              ALICI, teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir.
            </p>
              Cayma bildirimi yazılı olarak (e-posta vb.) yapılmalıdır.
            <p>
              ALICI, teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir." ibaresi yerine "ALICI, 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı teslim tarihinden itibaren başlayacaktır. Cayma hakkının kullanıldığına dair bildirimin teslimden 14 gün içinde satıcıya yöneltilmiş olması gerekir. Mesafeli Sözleşmeler Yönetmeliğinin 13/2. maddesi gereği cayma hakkının kullanılmasında mutat kullanımı aşan bozulmalar halinde ALICI kendisi sorumludur.            </p>
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
            <li>Taraflarca aksi kararlaştırılmadıkça, tüketici aşağıdaki sözleşmelerde cayma hakkını kullanamaz,</li>
            <li>a) Tüketicinin istekleri doğrultusunda hazırlanan özel üretim ürünlerinin ayıplı durumlar dışında iadesi ve değişimi mümkün değildir. Bu ürünlerde cayma hakkı kullanılamaz.
</li>
            <li>b) Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler.
</li>
            <li> c) Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler.
</li>
            <li> d) Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler.
</li>


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
