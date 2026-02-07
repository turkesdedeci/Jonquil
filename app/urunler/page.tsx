import { Metadata } from 'next';
import { allProducts } from '@/data/products';
import AllProductsClient from './AllProductsClient';

export const metadata: Metadata = {
  title: 'Tüm Ürünler | Jonquil - El Yapımı Türk Porseleni',
  description:
    'Jonquil koleksiyonlarından tüm el yapımı porselen ürünleri keşfedin. Tabaklar, fincanlar, aksesuarlar ve daha fazlası.',
  keywords: [
    'porselen ürünler',
    'el yapımı porselen',
    'Türk porseleni',
    'tabak',
    'fincan',
    'Jonquil',
  ],
  openGraph: {
    title: 'Tüm Ürünler | Jonquil',
    description: 'El yapımı porselen ürünlerimizi keşfedin.',
    type: 'website',
    locale: 'tr_TR',
  },
  alternates: {
    canonical: 'https://jonquil.com.tr/urunler',
  },
};

// JSON-LD for product listing
function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tüm Ürünler',
    description: 'Jonquil koleksiyonlarından tüm el yapımı porselen ürünleri.',
    url: 'https://jonquil.com.tr/urunler',
    numberOfItems: allProducts.length,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Jonquil',
      url: 'https://jonquil.com.tr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jonquil',
    },
  };
}

export default function AllProductsPage() {
  const jsonLd = generateJsonLd();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component */}
      <AllProductsClient products={allProducts} />
    </>
  );
}
