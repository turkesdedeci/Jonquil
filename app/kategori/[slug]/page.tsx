import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProductsServer } from '@/lib/products-server';
import { sortProductsForCatalog } from '@/lib/product-sort';
import { absoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/site';
import CategoryPageClient from './CategoryPageClient';

// Category mapping (slug -> display name & metadata)
const categories = {
  tabaklar: {
    name: 'Tabaklar',
    productType: 'Tabak',
    description:
      'Premium porselen tabaklar. Servis tabakları, pasta tabakları ve daha fazlası. Jonquil koleksiyonlarından zarif sofra ürünleri.',
    keywords: ['tabak', 'servis tabağı', 'pasta tabağı', 'porselen tabak'],
    intro:
      'Sofranın temelini tabaklar oluşturur. Jonquil Studio tabak koleksiyonu; servis tabağı, pasta tabağı ve paylaşım tabağı seçenekleriyle her sunum ihtiyacına cevap verir. Aslan koleksiyonunun klasik altın detayları veya Ottoman koleksiyonunun canlı renkleriyle sofranıza zamansız bir karakter katabilirsiniz. Tüm tabaklar birinci sınıf porselen malzemeyle üretilir ve bulaşık makinesine uygundur.',
  },
  fincanlar: {
    name: 'Fincanlar & Kupalar',
    productType: 'Fincan & Kupa',
    description:
      'Özenle üretilmiş porselen fincanlar ve kupalar. Türk kahvesi fincanları, çay fincanları ve kupa setleri. Özel tasarım kahve keyfi.',
    keywords: ['fincan', 'kupa', 'kahve fincanı', 'çay fincanı', 'porselen fincan'],
    intro:
      'Kahve ve çay ritüellerinize özel anlam katacak fincan ve kupalar. Türk kahvesi fincan setlerinden günlük kullanıma uygun kupalara kadar geniş bir seçki sunan koleksiyonumuz, sofra stilinizi tamamlar. Her parça, ergonomik form ve göze hitap eden tasarımı bir arada sunar. İkili setler hediye olarak da mükemmel bir tercih oluşturur.',
  },
  kullukler: {
    name: 'Küllükler',
    productType: 'Küllük',
    description:
      'Cam ve porselen küllükler. Puro ve sigara küllükleri. Dekoratif ve fonksiyonel tasarımlar.',
    keywords: ['küllük', 'puro küllüğü', 'cam küllük', 'dekoratif küllük'],
    intro:
      'Jonquil küllükleri, fonksiyonel bir aksesuar olmanın ötesinde birer dekorasyon objesidir. Porselen ve cam seçeneklerle sunulan koleksiyonumuz, yaşam alanlarınıza şık bir dokunuş katar. Puro küllüklerinden kompakt tasarımlara kadar her ihtiyaca uygun parçalar mevcuttur. Bir sofra aksesuarı olarak veya hediye olarak fark yaratan bir seçimdir.',
  },
  mumluklar: {
    name: 'Mumluklar',
    productType: 'Mumluk',
    description:
      'Dekoratif mumluklar. Atmosfer yaratan tasarım mumluklar. Cam ve porselen seçenekler.',
    keywords: ['mumluk', 'cam mumluk', 'dekoratif mumluk', 'şamdan'],
    intro:
      'Atmosfer yaratmanın en zarif yolu, doğru mumluktur. Jonquil Studio mumlukları hem mum yandığında hem söndüğünde dekoratif değer taşır. Porselen gövde üzerine altın ve renk detaylarıyla tasarlanan mumluklar, sofra düzeni veya ev dekorasyonunda güçlü bir vurgu noktası oluşturur. Mum bittikten sonra fincan olarak da kullanılabilir.',
  },
  aksesuarlar: {
    name: 'Aksesuarlar',
    productType: 'Aksesuar',
    description:
      'Tasarım aksesuarlar. Dekoratif objeler ve fonksiyonel aksesuarlar. Sofra ve ev dekorasyonu için özel parçalar.',
    keywords: ['aksesuar', 'dekoratif obje', 'ev aksesuarı'],
    intro:
      'Sofra ve yaşam alanı aksesuarları, küçük detaylarla büyük farklar yaratır. Bardak altlıklarından dekoratif cam objelere kadar uzanan Jonquil aksesuar koleksiyonu, koleksiyonunuzu tamamlayan parçalar sunar. Her aksesuar, ana koleksiyon parçalarıyla uyumlu renk ve desen dilinde tasarlanmıştır.',
  },
  tekstil: {
    name: 'Tekstil',
    productType: 'Tekstil',
    description:
      'Özel tasarım tekstil ürünleri. Masa örtüleri, peçeteler ve ev tekstili. Özenle üretilmiş dokuma ve baskı tasarımlar.',
    keywords: ['tekstil', 'masa örtüsü', 'peçete', 'ev tekstili'],
    intro:
      'Jonquil tekstil koleksiyonu, porselen parçalarınızla uyumlu bir sofra dokusu oluşturmanızı sağlar. Dekoratif yastıklar ve özel baskı tasarımlarla yaşam alanlarınıza sıcaklık ve karakter katar. Her tekstil parçası, koleksiyonların renk paletine uygun olarak tasarlanmıştır.',
  },
  tepsiler: {
    name: 'Tepsiler & Kutular',
    productType: 'Tepsi & Kutu',
    description:
      'Tasarım tepsiler ve kutular. Servis tepsileri, dekoratif kutular. Sunum ve saklama için şık çözümler.',
    keywords: ['tepsi', 'kutu', 'servis tepsisi', 'dekoratif kutu'],
    intro:
      'Servis ve sunum kalitesini yükselten tepsiler ile dekoratif saklama kutuları. Oval tepsilerden altıgen formlara, akrilik kutulardan dikdörtgen servis parçalarına kadar geniş bir yelpaze sunar. Her parça, sofra düzeninize düzen ve zarafet katarken günlük kullanımda da pratik çözümler sağlar.',
  },
} as const;

type CategorySlug = keyof typeof categories;

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 300;
const siteUrl = getSiteUrl();

// Generate static params for all categories
export async function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!categories[slug as CategorySlug]) {
    return {
      title: 'Kategori Bulunamadı | Jonquil',
    };
  }

  const category = categories[slug as CategorySlug];
  const title = `${category.name} | Jonquil Studio Premium Porselen`;
  const description = category.description;
  const imageUrl = '/images/og-default.jpg';

  return {
    title,
    description,
    keywords: [...category.keywords, 'Jonquil', 'Türk porseleni', 'tasarım porselen', 'lüks'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      url: absoluteUrl(`/kategori/${slug}`),
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteUrl(imageUrl),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(imageUrl)],
    },
    alternates: {
      canonical: absoluteUrl(`/kategori/${slug}`),
    },
  };
}

// JSON-LD for category
function generateJsonLd(slug: CategorySlug, productCount: number) {
  const category = categories[slug];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: absoluteUrl(`/kategori/${slug}`),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
    numberOfItems: productCount,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  if (!categories[slug as CategorySlug]) {
    notFound();
  }

  const categorySlug = slug as CategorySlug;
  const category = categories[categorySlug];

  // Get products for this category
  const allProducts = await getAllProductsServer();
  const products = sortProductsForCatalog(
    allProducts.filter((p) => p.productType === category.productType)
  );

  const jsonLd = generateJsonLd(categorySlug, products.length);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component */}
      <CategoryPageClient
        slug={categorySlug}
        name={category.name}
        description={category.description}
        intro={category.intro}
        products={products}
      />
    </>
  );
}
