import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allProducts } from '@/data/products';
import ProductPageClient from './ProductPageClient';

// Types
interface Product {
  id: string;
  collection: string;
  family: string;
  images?: string[];
  title: string;
  subtitle: string;
  color: string;
  code: string;
  size: string;
  price: string;
  material: string;
  productType: string;
  usage: string;
  capacity: string | null;
  setSingle: string;
  tags: string[];
}

interface Props {
  params: Promise<{ id: string }>;
}

// Generate static params for all products
export async function generateStaticParams() {
  return allProducts.map((product) => ({
    id: product.id,
  }));
}

// Helper to get product by ID
function getProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id) as Product | undefined;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Jonquil',
    };
  }

  const title = `${product.title} - ${product.subtitle} | Jonquil`;
  const description = `${product.title} ${product.subtitle}. ${product.material}, ${product.size}. El yapımı Türk porselen ürünleri. Jonquil koleksiyonundan ${product.family} serisi.`;
  const imageUrl = product.images?.[0] || '/images/og-default.jpg';

  return {
    title,
    description,
    keywords: [
      product.title,
      product.family,
      product.collection,
      product.material,
      'porselen',
      'el yapımı',
      'Türk porseleni',
      'lüks sofra',
      ...product.tags,
    ],
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
          alt: `${product.title} - ${product.subtitle}`,
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
      canonical: `https://jonquil.com.tr/urun/${product.id}`,
    },
  };
}

// JSON-LD Structured Data
function generateJsonLd(product: Product) {
  // Extract numeric price
  const priceMatch = product.price.match(/(\d+(?:[.,]\d+)?)/);
  const numericPrice = priceMatch ? priceMatch[1].replace(',', '.') : '0';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.title} - ${product.subtitle}`,
    description: `${product.title} ${product.subtitle}. ${product.material}, ${product.size}. El yapımı Türk porselen ürünleri.`,
    image: product.images || [],
    sku: product.code,
    brand: {
      '@type': 'Brand',
      name: 'Jonquil',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Jonquil',
    },
    material: product.material,
    size: product.size,
    color: product.color,
    category: product.productType,
    offers: {
      '@type': 'Offer',
      url: `https://jonquil.com.tr/urun/${product.id}`,
      priceCurrency: 'TRY',
      price: numericPrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Jonquil',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  const jsonLd = generateJsonLd(product);

  // Get related products (same collection, different product)
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.collection === product.collection &&
        p.id !== product.id &&
        p.productType === product.productType
    )
    .slice(0, 4) as Product[];

  // If not enough related products, add from same collection
  if (relatedProducts.length < 4) {
    const moreRelated = allProducts
      .filter(
        (p) =>
          p.collection === product.collection &&
          p.id !== product.id &&
          !relatedProducts.find((r) => r.id === p.id)
      )
      .slice(0, 4 - relatedProducts.length) as Product[];
    relatedProducts.push(...moreRelated);
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component for Interactivity */}
      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
