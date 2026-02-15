import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProductsServer, getProductByIdServer, ServerProduct } from '@/lib/products-server';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import ProductPageClient from './ProductPageClient';

export const dynamic = 'force-dynamic';

// Types
interface Product {
  id: string;
  collection: string;
  family: string;
  images?: string[];
  title: string;
  subtitle: string;
  description?: string | null;
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

// Corrected Props interface for server components
interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

// Helper to normalize product data from the server
function normalizeProduct(product: ServerProduct): Product {
  return {
    id: product.id,
    collection: product.collection,
    family: product.family || product.collection?.toUpperCase() || '',
    images: product.images || [],
    title: product.title,
    subtitle: product.subtitle || '',
    description: product.description || null,
    color: product.color || '',
    code: product.code || '',
    size: product.size || '',
    price: product.price,
    material: product.material || 'Porselen',
    productType: product.productType || '',
    usage: product.usage || '',
    capacity: product.capacity || null,
    setSingle: product.setSingle || 'Tek Parça',
    tags: product.tags || [],
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id: paramId } = await params;
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const id = paramId || queryId;
  if (!id) {
    return {
      title: 'Ürün Bulunamadı | Jonquil',
      description: 'Ürün bilgileri yüklenemedi.',
    };
  }
  
  const product = await getProductByIdServer(id);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Jonquil',
    };
  }

  const normalizedProduct = normalizeProduct(product);
  const title = `${normalizedProduct.title} - ${normalizedProduct.subtitle} | Jonquil`;
  const description =
    normalizedProduct.description?.trim() ||
    `${normalizedProduct.title} ${normalizedProduct.subtitle}. ${normalizedProduct.material}, ${normalizedProduct.size}. El yapımı Türk porselen ürünleri. Jonquil koleksiyonundan ${normalizedProduct.family} serisi.`;
  const imageUrl = normalizedProduct.images?.[0] || '/images/og-default.jpg';

  return {
    title,
    description,
    keywords: [
      normalizedProduct.title,
      normalizedProduct.family,
      normalizedProduct.collection,
      normalizedProduct.material,
      'porselen',
      'el yapımı',
      'Türk porseleni',
      'lüks sofra',
      ...normalizedProduct.tags,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      url: absoluteUrl(`/urun/${id}`),
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteUrl(imageUrl),
          width: 1200,
          height: 630,
          alt: normalizedProduct.title,
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
      canonical: absoluteUrl(`/urun/${id}`),
    },
  };
}

// Helper to generate JSON-LD structured data
function generateJsonLd(product: Product) {
  const numericPrice = parseFloat(product.price.replace(/[^0-9,-]+/g, '').replace(',', '.'));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.[0],
    description: product.description?.trim() || `${product.title} ${product.subtitle}. ${product.material}, ${product.size}.`,
    sku: product.code,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    material: product.material,
    size: product.size,
    color: product.color,
    category: product.productType,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/urun/${product.id}`),
      priceCurrency: 'TRY',
      price: numericPrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const debugMode = searchParams?.debug === '1' && process.env.NODE_ENV !== 'production';
  const { id: paramId } = await params;
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const id = paramId || queryId;

  if (!id) {
    notFound();
  }

  const product = await getProductByIdServer(id);

  if (!product) {
    if (debugMode) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
          <h1>Product Debug</h1>
          <pre>{JSON.stringify({ id, found: false }, null, 2)}</pre>
        </div>
      );
    }
    notFound();
  }

  const normalizedProduct = normalizeProduct(product);
  const jsonLd = generateJsonLd(normalizedProduct);
  const allProductsServer = await getAllProductsServer();

  // Related products: score by real similarity (collection + type + color + family)
  const relatedProducts = allProductsServer
    .filter((p) => p.id !== normalizedProduct.id && p.inStock !== false)
    .map((p) => {
      let score = 0;
      if (p.collection === normalizedProduct.collection) score += 4;
      if (p.productType && p.productType === normalizedProduct.productType) score += 3;
      if (p.color && p.color === normalizedProduct.color) score += 2;
      if (p.family && p.family === normalizedProduct.family) score += 2;
      if (p.material && p.material === normalizedProduct.material) score += 1;
      return { product: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.product) as ServerProduct[];

  // Fallback: same collection if similarity pool is small
  if (relatedProducts.length < 4) {
    const moreRelated = allProductsServer
      .filter(
        (p) =>
          p.collection === normalizedProduct.collection &&
          p.id !== normalizedProduct.id &&
          p.inStock !== false &&
          !relatedProducts.some((r) => r.id === p.id)
      )
      .slice(0, 4 - relatedProducts.length) as ServerProduct[];
    relatedProducts.push(...moreRelated);
  }
  const normalizedRelatedProducts = relatedProducts.map(normalizeProduct);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client Component for Interactivity */}
      <ProductPageClient
        product={normalizedProduct}
        relatedProducts={normalizedRelatedProducts}
      />
    </>
  );
}

