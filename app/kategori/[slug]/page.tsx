import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAllProductsServer } from '@/lib/products-server';
import CategoryPageClient from './CategoryPageClient';

// Category mapping (slug -> display name & metadata)
const categories = {
  tabaklar: {
    name: 'Tabaklar',
    productType: 'Tabak',
    description:
      'El yapımı porselen tabaklar. Servis tabakları, pasta tabakları ve daha fazlası. Jonquil koleksiyonlarından zarif sofra ürünleri.',
    keywords: ['tabak', 'servis tabağı', 'pasta tabağı', 'porselen tabak'],
  },
  fincanlar: {
    name: 'Fincanlar & Kupalar',
    productType: 'Fincan & Kupa',
    description:
      'El yapımı porselen fincanlar ve kupalar. Türk kahvesi fincanları, çay fincanları ve kupa setleri. Özel tasarım kahve keyfi.',
    keywords: ['fincan', 'kupa', 'kahve fincanı', 'çay fincanı', 'porselen fincan'],
  },
  kullukler: {
    name: 'Küllükler',
    productType: 'Küllük',
    description:
      'El yapımı cam ve porselen küllükler. Puro ve sigara küllükleri. Dekoratif ve fonksiyonel tasarımlar.',
    keywords: ['küllük', 'puro küllüğü', 'cam küllük', 'dekoratif küllük'],
  },
  mumluklar: {
    name: 'Mumluklar',
    productType: 'Mumluk',
    description:
      'El yapımı mumluklar. Atmosfer yaratan dekoratif mumluklar. Cam ve porselen tasarımlar.',
    keywords: ['mumluk', 'cam mumluk', 'dekoratif mumluk', 'şamdan'],
  },
  aksesuarlar: {
    name: 'Aksesuarlar',
    productType: 'Aksesuar',
    description:
      'El yapımı aksesuarlar. Dekoratif objeler ve fonksiyonel aksesuarlar. Sofra ve ev dekorasyonu için özel parçalar.',
    keywords: ['aksesuar', 'dekoratif obje', 'ev aksesuarı'],
  },
  tekstil: {
    name: 'Tekstil',
    productType: 'Tekstil',
    description:
      'El yapımı tekstil ürünleri. Masa örtüleri, peçeteler ve ev tekstili. Özel dokuma ve baskı tasarımlar.',
    keywords: ['tekstil', 'masa örtüsü', 'peçete', 'ev tekstili'],
  },
  tepsiler: {
    name: 'Tepsiler & Kutular',
    productType: 'Tepsi & Kutu',
    description:
      'El yapımı tepsiler ve kutular. Servis tepsileri, dekoratif kutular. Sunum ve saklama için şık çözümler.',
    keywords: ['tepsi', 'kutu', 'servis tepsisi', 'dekoratif kutu'],
  },
} as const;

type CategorySlug = keyof typeof categories;

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 300;

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
  const title = `${category.name} | Jonquil - El Yapımı Türk Porseleni`;
  const description = category.description;
  const imageUrl = '/images/og-default.jpg';

  return {
    title,
    description,
    keywords: [...category.keywords, 'Jonquil', 'Türk porseleni', 'el yapımı', 'lüks'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Jonquil',
      images: [
        {
          url: imageUrl,
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
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://jonquil.com.tr/kategori/${slug}`,
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
    url: `https://jonquil.com.tr/kategori/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Jonquil',
      url: 'https://jonquil.com.tr',
    },
    numberOfItems: productCount,
    publisher: {
      '@type': 'Organization',
      name: 'Jonquil',
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const nonce = headers().get('x-nonce') || undefined;
  const { slug } = await params;

  if (!categories[slug as CategorySlug]) {
    notFound();
  }

  const categorySlug = slug as CategorySlug;
  const category = categories[categorySlug];

  // Get products for this category
  const allProducts = await getAllProductsServer();
  const products = allProducts.filter((p) => p.productType === category.productType);

  const jsonLd = generateJsonLd(categorySlug, products.length);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component */}
      <CategoryPageClient
        slug={categorySlug}
        name={category.name}
        description={category.description}
        products={products}
      />
    </>
  );
}
