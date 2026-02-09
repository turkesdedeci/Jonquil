import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAllProductsServer, getProductByIdServer, ServerProduct } from '@/lib/products-server';
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
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

async function getIdFromHeaders(): Promise<string | undefined> {
  try {
    const h = await headers();
    const candidates = [
      h.get('x-original-url'),
      h.get('x-vercel-original-url'),
      h.get('x-forwarded-uri'),
      h.get('x-forwarded-path'),
      h.get('x-rewrite-url'),
      h.get('x-middleware-rewrite'),
    ].filter(Boolean) as string[];

    for (const raw of candidates) {
      const url = new URL(raw, 'https://example.com');
      const fromQuery = url.searchParams.get('id');
      if (fromQuery) return fromQuery;
      const match = url.pathname.match(/^\/urun\/([^/]+)$/);
      if (match?.[1]) return match[1];
    }
  } catch {
    // ignore header parsing errors
  }
  return undefined;
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
  console.log(`[generateMetadata] Params received: ${JSON.stringify(params)}`);
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const id = params?.id || queryId || await getIdFromHeaders();
  if (!id) {
    console.error('[generateMetadata] ID is undefined, cannot generate metadata.');
    return {
      title: 'Ürün Bulunamadı | Jonquil',
      description: 'Ürün bilgileri yüklenemedi.',
    };
  }
  
  const product = await getProductByIdServer(id);

  if (!product) {
    console.warn(`[generateMetadata] Product not found for ID: ${id}`);
    return {
      title: 'Ürün Bulunamadı | Jonquil',
    };
  }

  const normalizedProduct = normalizeProduct(product);
  const title = `${normalizedProduct.title} - ${normalizedProduct.subtitle} | Jonquil`;
  const description = `${normalizedProduct.title} ${normalizedProduct.subtitle}. ${normalizedProduct.material}, ${normalizedProduct.size}. El yapımı Türk porselen ürünleri. Jonquil koleksiyonundan ${normalizedProduct.family} serisi.`;
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
      siteName: 'Jonquil',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: normalizedProduct.title,
        },
      ],
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
    description: `${product.title} ${product.subtitle}. ${product.material}, ${product.size}.`, // Simplified description
    sku: product.code,
    brand: {
      '@type': 'Brand',
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

export default async function ProductPage({ params, searchParams }: Props) {
  const debugMode = searchParams?.debug === '1';
  const queryId = typeof searchParams?.id === 'string'
    ? searchParams.id
    : Array.isArray(searchParams?.id)
      ? searchParams?.id[0]
      : undefined;
  const id = params?.id || queryId || await getIdFromHeaders();
  console.log(`[ProductPage] Initial ID from params: ${id}`);
  
  if (!id) {
    console.error('[ProductPage] ID is undefined, returning notFound.');
    notFound();
  }

  const product = await getProductByIdServer(id);

  if (!product) {
    console.warn(`[ProductPage] Product not found for ID: ${id}`);
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

  // Get related products (same collection, different product)
  const relatedProducts = allProductsServer
    .filter(
      (p) =>
        p.collection === normalizedProduct.collection &&
        p.id !== normalizedProduct.id &&
        p.productType === normalizedProduct.productType
    )
    .slice(0, 4) as ServerProduct[];

  // If not enough related products, add from same collection
  if (relatedProducts.length < 4) {
    const moreRelated = allProductsServer
      .filter(
        (p) =>
          p.collection === normalizedProduct.collection &&
          p.id !== normalizedProduct.id &&
          !relatedProducts.some((r) => r.id === p.id) // Use .some() for checking existence
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
