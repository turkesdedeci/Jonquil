import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Özel Çalışmalar - JONQUIL STUDIO",
  description:
    "Jonquil Studio'nun mekanlara, markalara ve özel davetlere yönelik özel tasarım çalışma örnekleri.",
};

const customProjects = [
  {
    title: "Butik Otel Kahvaltı Sunumu",
    summary:
      "Mekanın renk paletine uygun, servis ritmini bozmayan özel bir tabak-fincan seti geliştirildi.",
    scope: "Konsept seçimi, renk uyarlaması, 40 kişilik setleme",
    image: "/images/products/GENEL FOTOLAR/Header-1.jpg",
  },
  {
    title: "Kurumsal Hediye Koleksiyonu",
    summary:
      "Marka kimliğine uygun desen dili ile sınırlı adet üretim yapılarak premium hediye seti hazırlandı.",
    scope: "Logo entegrasyonu, özel kutulama, sınırlı seri",
    image: "/images/products/GENEL FOTOLAR/Header-2.jpg",
  },
  {
    title: "Eve Özel Davet Sofrası",
    summary:
      "Ev sahibinin kullanım alışkanlığına göre parça adetleri optimize edildi ve bütüncül bir sofra dili kuruldu.",
    scope: "İhtiyaç analizi, ürün eşleştirme, stil danışmanlığı",
    image: "/images/products/GENEL FOTOLAR/Header-3.jpg",
  },
];

const processSteps = [
  "İhtiyaç ve kullanım senaryosunu birlikte netleştiriyoruz.",
  "Renk, form ve ürün kapsamını mekanınıza göre belirliyoruz.",
  "Sunum, kutulama ve teslim planını proje kapsamında tamamlıyoruz.",
];

export default function OzelCalismalarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 h-1 w-12 rounded-full bg-[#0f3f44]" />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          Özel Çalışmalar
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Buradaki örnekler, markalara ve özel davetlere yönelik yaptığımız kişiselleştirilmiş çalışmalardan
          derlenmiştir. Her proje; kullanım amacı, mekan dili ve uzun ömürlü kalite anlayışıyla ele alınır.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {customProjects.map((project) => (
          <article
            key={project.title}
            className="overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>
            <div className="space-y-2 p-5">
              <h2 className="text-lg font-semibold leading-tight text-neutral-900">{project.title}</h2>
              <p className="text-sm leading-6 text-neutral-600">{project.summary}</p>
              <p className="text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">Kapsam:</span> {project.scope}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-6 md:p-8">
        <h2 className="text-xl font-semibold text-neutral-900">Nasıl İlerliyoruz?</h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-700">
          {processSteps.map((step) => (
            <li key={step} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0f3f44]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-4">
          <p className="max-w-xl text-sm text-neutral-700">
            Kendi mekanınız veya markanız için özel bir çalışma planlamak isterseniz,
            detayları birlikte netleştirebiliriz.
          </p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f3f44] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2f34]"
          >
            Özel Proje Talebi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
