import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allProducts } from '@/data/products';
import CollectionPageClient from './CollectionPageClient';

// Collection data
const collections = {
  aslan: {
    name: 'Aslan Koleksiyonu',
    description:
      'Klasik Osmanlı aslan motiflerinden ilham alan zarif porselen koleksiyonumuz. El yapımı, altın detaylı, sofranıza kraliyet havası katan eşsiz parçalar.',
    heroImage: '/images/collections/aslan-hero.jpg',
    keywords: ['aslan', 'klasik', 'osmanlı', 'altın', 'porselen', 'el yapımı'],
  },
  ottoman: {
    name: 'Ottoman Koleksiyonu',
    description:
      'Renkli Osmanlı desenlerinden ilham alan canlı porselen koleksiyonumuz. Geleneksel motifleri modern tasarımlarla buluşturan özgün parçalar.',
    heroImage: '/images/collections/ottoman-hero.jpg',
    keywords: ['ottoman', 'renkli', 'desenli', 'osmanlı', 'porselen', 'modern'],
  },
} as const;

type CollectionSlug = keyof typeof collections;

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for collections
export async function generateStaticParams() {
  return Object.keys(collections).map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!collections[slug as CollectionSlug]) {
    return {
      title: 'Koleksiyon Bulunamadı | Jonquil',
    };
  }

  const collection = collections[slug as CollectionSlug];
  const title = `${collection.name} | Jonquil - El Yapımı Türk Porseleni`;
  const description = collection.description;

  return {
    title,
    description,
    keywords: [...collection.keywords, 'Jonquil', 'Türk porseleni', 'lüks sofra'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Jonquil',
      images: [
        {
          url: collection.heroImage,
          width: 1200,
          height: 630,
          alt: collection.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [collection.heroImage],
    },
    alternates: {
      canonical: `https://jonquil.com.tr/koleksiyon/${slug}`,
    },
  };
}

// JSON-LD for collection
function generateJsonLd(slug: CollectionSlug, productCount: number) {
  const collection = collections[slug];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: `https://jonquil.com.tr/koleksiyon/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Jonquil',
      url: 'https://jonquil.com.tr',
    },
    numberOfItems: productCount,
    publisher: {
      '@type': 'Organization',
      name: 'Jonquil',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jonquil.com.tr/images/logo.png',
      },
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  if (!collections[slug as CollectionSlug]) {
    notFound();
  }

  const collectionSlug = slug as CollectionSlug;
  const collection = collections[collectionSlug];

  // Get products for this collection
  const products = allProducts.filter((p) => p.collection === slug);

  const jsonLd = generateJsonLd(collectionSlug, products.length);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component */}
      <CollectionPageClient
        slug={collectionSlug}
        name={collection.name}
        description={collection.description}
        products={products}
      />
    </>
  );
}
