 import { Metadata } from 'next';
 import { notFound } from 'next/navigation';
 import { allProducts } from '@/data/products';
 import { getAllProductsServer, getProductByIdServer, ServerProduct } from '@/lib/products-server';
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
 export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { id } = await params;
   const product = getProduct(id);
   const product = await getProductByIdServer(id);
 
   if (!product) {
     return {
       title: 'Ürün Bulunamadı | Jonquil',
     };
   }
 
   const title = `${product.title} - ${product.subtitle} | Jonquil`;
   const description = `${product.title} ${product.subtitle}. ${product.material}, ${product.size}. El yapımı Türk porselen ürünleri. Jonquil koleksiyonundan ${product.family} serisi.`;
   const imageUrl = product.images?.[0] || '/images/og-default.jpg';
   const normalizedProduct = normalizeProduct(product);
   const title = `${normalizedProduct.title} - ${normalizedProduct.subtitle} | Jonquil`;
   const description = `${normalizedProduct.title} ${normalizedProduct.subtitle}. ${normalizedProduct.material}, ${normalizedProduct.size}. El yapımı Türk porselen ürünleri. Jonquil koleksiyonundan ${normalizedProduct.family} serisi.`;
   const imageUrl = normalizedProduct.images?.[0] || '/images/og-default.jpg';
 
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
@@ -119,72 +137,76 @@ function generateJsonLd(product: Product) {
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
   const product = await getProductByIdServer(id);
 
   if (!product) {
     notFound();
   }
 
  const jsonLd = generateJsonLd(product);
  const normalizedProduct = normalizeProduct(product);
  const jsonLd = generateJsonLd(normalizedProduct);
  const allProductsServer = await getAllProductsServer();
 
   // Get related products (same collection, different product)
  const relatedProducts = allProducts
  const relatedProducts = allProductsServer
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
    const moreRelated = allProductsServer
       .filter(
         (p) =>
           p.collection === product.collection &&
           p.id !== product.id &&
           !relatedProducts.find((r) => r.id === p.id)
       )
       .slice(0, 4 - relatedProducts.length) as Product[];
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
        product={product}
        relatedProducts={relatedProducts}
        product={normalizedProduct}
        relatedProducts={normalizedRelatedProducts}
       />
     </>
   );
 }
