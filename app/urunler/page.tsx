import { Metadata } from 'next';
import { getAllProductsServer } from '@/lib/products-server';
import { sortProductsForCatalog } from '@/lib/product-sort';
import { absoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/site';
import AllProductsClient from './AllProductsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Tüm Ürünler | Jonquil Studio Premium Porselen',
  description:
    'Jonquil koleksiyonlarından tüm premium porselen ürünleri keşfedin. Tabaklar, fincanlar, aksesuarlar ve daha fazlası.',
  keywords: [
    'porselen ürünler',
    'tasarım porselen',
    'Türk porseleni',
    'tabak',
    'fincan',
    'Jonquil',
  ],
  openGraph: {
    title: 'Tüm Ürünler | Jonquil',
    description: 'Premium porselen koleksiyonlarımızı keşfedin.',
    type: 'website',
    locale: 'tr_TR',
    url: absoluteUrl('/urunler'),
    images: [
      {
        url: absoluteUrl('/images/og-default.jpg'),
        alt: 'Tüm Ürünler | Jonquil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tüm Ürünler | Jonquil',
    description: 'Premium porselen koleksiyonlarımızı keşfedin.',
    images: [absoluteUrl('/images/og-default.jpg')],
  },
  alternates: {
    canonical: absoluteUrl('/urunler'),
  },
};

function generateJsonLd(productCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tüm Ürünler',
    description: 'Jonquil koleksiyonlarından tüm premium porselen ürünleri.',
    url: absoluteUrl('/urunler'),
    numberOfItems: productCount,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export default async function AllProductsPage() {
  const products = sortProductsForCatalog(await getAllProductsServer());
  const jsonLd = generateJsonLd(products.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllProductsClient products={products} />
    </>
  );
}
