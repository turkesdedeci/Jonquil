import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası - JONQUIL STUDIO",
  description: "JONQUIL STUDIO gizlilik politikası ve kişisel verilerin korunması",
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 h-1 w-12 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Gizlilik Politikası
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-neutral-600">
        <p>
          JONQUIL STUDIO olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz.
          Bu bilinçle, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuat kapsamında
          kişisel verileriniz aşağıda açıklanan şekilde işlenmektedir.
        </p>

        {/* Bölüm 1 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            1. Kişisel Verilerin Toplanması
          </h2>
          <p className="mb-3">
            Kişisel verileriniz, aşağıdaki yöntemlerle toplanmaktadır:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Web sitemiz üzerinden sipariş verirken</li>
            <li>Üyelik oluşturma ve hesap güncelleme işlemlerinde</li>
            <li>Müşteri hizmetleri ile iletişime geçtiğinizde</li>
            <li>Bültene abone olduğunuzda</li>
            <li>Çerezler (cookies) aracılığıyla</li>
          </ul>
        </section>

        {/* Bölüm 2 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            2. Toplanan Kişisel Veriler
          </h2>
          <p className="mb-3">Topladığımız kişisel veriler şunlardır:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi, fatura adresi</li>
            <li><strong>Finansal Bilgiler:</strong> Ödeme bilgileri (kart bilgileri güvenli ödeme altyapısı iyzico tarafından işlenir)</li>
            <li><strong>İşlem Bilgileri:</strong> Sipariş geçmişi, ürün tercihleri</li>
            <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgisi, cihaz bilgisi</li>
          </ul>
        </section>

        {/* Bölüm 3 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            3. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p className="mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Siparişlerinizin işlenmesi ve teslimatı</li>
            <li>Müşteri hizmetleri desteği sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura düzenleme, vergi mevzuatı vb.)</li>
            <li>Ürün ve hizmetlerimizin geliştirilmesi</li>
            <li>Kampanya ve promosyonlardan haberdar edilmeniz (onayınız dahilinde)</li>
            <li>Dolandırıcılık ve güvenlik tehditlerine karşı koruma</li>
          </ul>
        </section>

        {/* Bölüm 4 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            4. Kişisel Verilerin Aktarımı
          </h2>
          <p className="mb-3">
            Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi için
            aşağıdaki taraflara aktarılabilir:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Kargo şirketleri:</strong> Siparişlerinizin teslimatı için</li>
            <li><strong>Ödeme hizmet sağlayıcıları:</strong> iyzico güvenli ödeme sistemi</li>
            <li><strong>Yasal merciler:</strong> Mevzuat gereği talep edilmesi halinde</li>
            <li><strong>İş ortakları:</strong> Hizmet kalitesinin artırılması amacıyla</li>
          </ul>
        </section>

        {/* Bölüm 5 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            5. Kişisel Verilerin Saklanması
          </h2>
          <p>
            Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve yasal
            yükümlülüklerimiz kapsamında saklanmaktadır. Ticari ilişkinin sona ermesinin
            ardından yasal saklama süreleri boyunca verileriniz muhafaza edilir ve süre
            sonunda güvenli bir şekilde silinir veya anonim hale getirilir.
          </p>
        </section>

        {/* Bölüm 6 - KVKK Hakları */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            6. KVKK Kapsamındaki Haklarınız
          </h2>
          <p className="mb-3">
            KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            <li>Yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            <li>•	Kişisel veri sahibi “İlgili Kişi” olarak sizler, 6698 Kişisel Verilerin Korunması Kanununun 11. maddesinde yer verilen haklarınızı kullanmak ve taleplerinizi bizlere bildirmek için kimliğinizi tespit edici gerekli bilgiler ile KVK Kanunu’nun 11. maddesinde belirtilen haklardan kullanmayı talep ettiğiniz hakkınıza yönelik açıklamalarınızı içeren bir formu “Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğe” göre “………..”  adresine,  yazılı olarak veya elektronik posta üzerinden info@jonquilstudio.co e-posta adresine güvenli elektronik imzalı olarak iletebilirsiniz. Şirketimiz, talebin niteliğine göre talebi en kısa sürede ve en geç otuz gün içinde sonuçlandıracaktır. </li>
            <li>Haklarınızın, ilgili Kanun’ un yürürlük tarihi olan 07.10.2016 tarihinden itibaren kullanılması mümkün olup, taleplerinizin yerine getirilmesini teminen tarafımızca yapılacak masrafları, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun “Veri sorumlusuna başvuru” başlıklı 13. maddesinde belirtilen tarifeye göre tarafınızdan talep etme hakkımız saklıdır. Ayrıca KVKK’nın 5. maddesinin 2. fıkrası uyarınca; kanunlarda açıkça öngörülmesi, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması, veri sorumlusu sıfatıyla şirketimizin hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması, ilgili kişi tarafından alenileştirilmiş olması, bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması, ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması, hallerinde ilgili Kanun uyarınca açık rıza aranmaksızın, kişisel verileri işleyebilme hakkı mevcut bulunmaktadır. 
Kanundan kaynaklanan saklama yükümlülüğümüz kapsamında belirli bir süre ile saklanması zorunlu olan kişisel verilerinizin silinmesini veya yok edilmesini talep etmeniz halinde, yasal zorunluluk gereği, yasal sürenin sonunda bu talebiniz yerine getirilebilecektir. 
</li>
          </ul>
          <p className="mt-4">
            Bu haklarınızı kullanmak için <strong>info@jonquil.com</strong> adresine yazılı olarak
            veya kayıtlı elektronik posta (KEP) aracılığıyla başvurabilirsiniz.
          </p>
        </section>

        {/* Bölüm 7 - Çerez Politikası */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            7. Çerez (Cookie) Politikası
          </h2>
          <p className="mb-3">
            Web sitemizde çeşitli çerezler kullanılmaktadır:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Zorunlu Çerezler:</strong> Web sitesinin düzgün çalışması için gerekli çerezlerdir.
              (Oturum yönetimi, sepet bilgileri vb.)
            </li>
            <li>
              <strong>Performans Çerezleri:</strong> Ziyaretçilerin siteyi nasıl kullandığını anlamamıza
              yardımcı olur. (Sayfa görüntüleme sayısı, ziyaret süresi vb.)
            </li>
            <li>
              <strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlamamızı sağlar.
              (Dil seçimi, tema tercihi vb.)
            </li>
            <li>
              <strong>Hedefleme/Reklam Çerezleri:</strong> Size özel reklamlar göstermek için kullanılır.
              (Onayınız dahilinde)
            </li>
          </ul>
          <p className="mt-4">
            Tarayıcı ayarlarınızdan çerezleri kontrol edebilir veya devre dışı bırakabilirsiniz.
            Ancak bazı çerezlerin devre dışı bırakılması site işlevselliğini etkileyebilir.
          </p>
        </section>

        {/* Bölüm 8 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            8. Güvenlik
          </h2>
          <p>
            Kişisel verilerinizin güvenliği için gerekli teknik ve idari önlemler alınmaktadır.
            Ödeme işlemleri, PCI DSS sertifikalı güvenli ödeme altyapısı iyzico üzerinden
            gerçekleştirilmekte olup, kredi kartı bilgileriniz sistemlerimizde saklanmamaktadır.
            Web sitemiz SSL sertifikası ile şifrelenmiştir.
          </p>
        </section>

        {/* Bölüm 9 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            9. Politika Güncellemeleri
          </h2>
          <p>
            Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler
            olması halinde web sitemizde duyuru yapılacaktır. Politikanın güncel
            versiyonunu her zaman bu sayfadan kontrol edebilirsiniz.
          </p>
        </section>

        {/* Bölüm 10 - İletişim */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            10. İletişim
          </h2>
          <p className="mb-3">
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <ul className="space-y-1 pl-4">
            <li><strong>E-posta:</strong> info@jonquil.com</li>
            <li><strong>Adres:</strong> [Şirket Adresi]</li>
            <li><strong>Telefon:</strong> +90 (XXX) XXX XX XX</li>
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
