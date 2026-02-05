import Image from "next/image";

export default function HakkimizdaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-28">
      <div className="mb-6 h-1 w-6 rounded-full bg-[#0f3f44]" />
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Hakkımızda</h1>

      <div className="mt-12 space-y-10 text-[15px] leading-7 text-neutral-600">
        <p>
          ssa, gündelik ritüellerin etrafında şekillenen porselen ve tasarım objeleri üretir.
          Her parça; sofrada, yaşam alanında ve zamanla kurulan ilişkide kalıcı olmayı hedefler.
          Markanın çıkış noktası, objenin yalnızca işlevini değil, kullanıldığı anı da düşünmektir.
        </p>

        <p>
          Koleksiyonlarımız; güçlü desenler, dengeli renk kullanımı ve net formlar üzerinden ilerler.
          Dekoratif olmaktan çok yaşayan, trendlerden çok zamansız bir dil benimser.
        </p>

        {/* --- DİREKT YOL İLE RESİM --- */}
        <div className="relative my-12 aspect-[16/9] overflow-hidden rounded-3xl shadow-sm bg-neutral-100">
          <Image
            src={`/images/products/GENEL FOTOLAR/✨ "Aslan Koleksiyonu ile yılbaşı sofralarınıza zamansız bir dokunuş katın. Koleksiyonun yeşil to.jpg`}
            alt="Jonquil Atölye"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            loading="lazy"
          />
        </div>

        <p>
          Üretim sürecinde kalite, tutarlılık ve detay önceliklidir.
          Porselenin karakteri korunur; altın detaylar, renkler ve yüzeyler göze batmadan var olur.
          Jonquil’de lüks, gösterişli olmaktan değil, tutarlılıktan doğar.
        </p>
      </div>
    </main>
  );
}