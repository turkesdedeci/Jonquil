"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Minus,
  Plus,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
} from 'lucide-react';
import { getColorSwatchStyle } from '@/utils/groupProducts';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useStock } from '@/contexts/StockContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SocialShare } from '@/components/SocialShare';

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
  variants?: Product[];
  selectedVariantIndex?: number;
}

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPageClient({
  product,
  relatedProducts,
}: ProductPageClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isInStock } = useStock();
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Track recently viewed product
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        price: product.price,
        image: product.images?.[0] || '/placeholder.jpg',
        collection: product.collection,
        viewedAt: Date.now(),
      });
    }
  }, [product, addToRecentlyViewed]);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    product.selectedVariantIndex || 0
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Check stock status
  const inStock = isInStock(product.id);

  // Get current variant
  const hasVariants = product.variants && product.variants.length > 1;
  const currentVariant = hasVariants
    ? product.variants![selectedVariantIndex]
    : null;

  // Safely get images with fallbacks
  const images = hasVariants
    ? currentVariant?.images || product.images || ['/placeholder.jpg']
    : product.images || ['/placeholder.jpg'];

  // Change variant (color)
  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setActiveImageIndex(0);
  };

  // Quantity controls
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  // Image navigation
  const nextImage = () =>
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Add to cart handler
  const handleAddToCart = () => {
    if (!inStock) return;

    const currentProduct = hasVariants
      ? {
          ...product,
          ...product.variants![selectedVariantIndex],
          images: images,
        }
      : product;

    addToCart(
      {
        id: currentProduct.id,
        productId: currentProduct.id,
        title: currentProduct.title,
        subtitle: currentProduct.subtitle || currentProduct.color,
        color: currentProduct.color,
        price: currentProduct.price,
        image: images[0],
        material: currentProduct.material || 'Porselen',
      },
      quantity
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    if (!inStock) return;
    handleAddToCart();
    setTimeout(() => {
      router.push('/odeme');
    }, 100);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#0f3f44]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Geri Dön
          </button>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* LEFT: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                className="relative aspect-[4/5] max-h-[60vh] overflow-hidden rounded-3xl bg-[#faf8f5] sm:aspect-square sm:max-h-none"
                layoutId={`product-${product.id}`}
              >
                {images.map((img: string, idx: number) => (
                  <Image
                    key={`${selectedVariantIndex}-${idx}`}
                    src={img}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`object-cover transition-opacity duration-300 ${
                      idx === activeImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    priority={idx === 0}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ))}

                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeImageIndex === index
                          ? 'border-[#0f3f44] ring-2 ring-[#0f3f44]/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info */}
            <div className="space-y-6">
              {/* Brand/Family */}
              <div className="text-xs font-light uppercase tracking-[0.2em] text-[#d4af7a]">
                {product.family}
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-4xl font-light leading-tight text-[#1a1a1a]">
                {product.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm text-[#666]">
                {currentVariant ? currentVariant.subtitle : product.subtitle}
              </p>

              {/* Price */}
              <div className="text-3xl font-semibold text-[#0f3f44]">
                {product.price}
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Color Selector */}
              {hasVariants && (
                <div>
                  <div className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                    Renk Seçimi
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants!.map((variant, index) => (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantChange(index)}
                        className="group relative"
                        title={variant.color}
                      >
                        <div
                          style={getColorSwatchStyle(variant.color)}
                          className={`h-10 w-10 rounded-full border-2 transition-all ${
                            selectedVariantIndex === index
                              ? 'border-[#0f3f44] ring-2 ring-[#0f3f44]/20'
                              : 'border-white shadow-md hover:scale-110'
                          }`}
                        />
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {variant.color}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Quantity Selector */}
              <div>
                <div className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                  Miktar
                </div>
                <div className="inline-flex items-center gap-4 rounded-full border border-[#e8e6e3] px-6 py-3">
                  <button
                    onClick={decrementQuantity}
                    className="text-[#0f3f44] transition-colors hover:text-[#d4af7a]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="text-[#0f3f44] transition-colors hover:text-[#d4af7a]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Out of Stock Warning */}
              {!inStock && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <XCircle className="h-6 w-6 shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-700">
                      Bu ürün şu an stokta yok
                    </p>
                    <p className="text-sm text-red-600">
                      Stok durumu için bizimle iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* Add to Cart Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart || !inStock}
                  className={`flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold transition-all active:scale-98 disabled:opacity-70 ${
                    inStock
                      ? 'bg-[#0f3f44] text-white hover:bg-[#0a2a2e]'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                >
                  {!inStock ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Stokta Yok
                    </>
                  ) : addedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      Sepete Eklendi!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Sepete Ekle
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className={`flex w-full items-center justify-center gap-3 rounded-full border-2 px-8 py-4 text-sm font-semibold transition-all active:scale-98 ${
                    inStock
                      ? 'border-[#0f3f44] bg-transparent text-[#0f3f44] hover:bg-[#0f3f44] hover:text-white'
                      : 'cursor-not-allowed border-gray-300 bg-transparent text-gray-400'
                  }`}
                >
                  {inStock ? 'Hemen Satın Al' : 'Satın Alınamaz'}
                </button>

                {/* Favorite and Share buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isFavorite(product.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-[#666] hover:text-[#0f3f44]'
                    }`}
                    aria-label={isFavorite(product.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                    {isFavorite(product.id) ? 'Favorilerde' : 'Favorilere Ekle'}
                  </button>

                  <SocialShare
                    url={typeof window !== 'undefined' ? window.location.href : `/urun/${product.id}`}
                    title={`${product.title} - Jonquil Studio`}
                    description={product.subtitle}
                    image={product.images?.[0]}
                  />
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Product Details Accordion */}
              <div className="space-y-4">
                {/* Description */}
                <div className="border-b border-[#e8e6e3]">
                  <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#1a1a1a]"
                  >
                    Ürün Açıklaması
                    <ChevronRight
                      className={`h-5 w-5 transition-transform ${
                        isDescriptionOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isDescriptionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pb-4"
                      >
                        <p className="text-sm leading-relaxed text-[#666]">
                          Jonquil Studio'nun özenle tasarladığı bu eşsiz parça,
                          modern yaşamın estetiğini klasik zanaatla buluşturuyor.
                          El işçiliği ve birinci sınıf porselen ile üretilen
                          ürünlerimiz, sofranıza zarafet katıyor.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Specifications */}
                <div className="border-b border-[#e8e6e3]">
                  <button
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#1a1a1a]"
                  >
                    Teknik Özellikler
                    <ChevronRight
                      className={`h-5 w-5 transition-transform ${
                        isSpecsOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isSpecsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pb-4"
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#999]">Malzeme:</span>
                            <span className="font-medium text-[#1a1a1a]">
                              {product.material}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#999]">Boyut:</span>
                            <span className="font-medium text-[#1a1a1a]">
                              {product.size}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#999]">Ürün Kodu:</span>
                            <span className="font-medium text-[#1a1a1a]">
                              {currentVariant ? currentVariant.code : product.code}
                            </span>
                          </div>
                          {product.capacity && (
                            <div className="flex justify-between">
                              <span className="text-[#999]">Kapasite:</span>
                              <span className="font-medium text-[#1a1a1a]">
                                {product.capacity}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[#999]">Koleksiyon:</span>
                            <span className="font-medium capitalize text-[#1a1a1a]">
                              {product.collection}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Stock Code */}
              <div className="rounded-lg bg-[#faf8f5] p-4">
                <div className="text-xs text-[#999]">STOK KODU</div>
                <div className="font-mono text-sm font-medium text-[#0f3f44]">
                  {currentVariant ? currentVariant.code : product.code}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <section className="mt-20 border-t border-[#e8e6e3] pt-20">
            <div className="mb-12">
              <h2 className="mb-3 text-center font-serif text-3xl font-light text-[#1a1a1a]">
                İlgili Ürünler
              </h2>
              <p className="text-center text-sm text-[#666]">
                Beğenebileceğiniz diğer ürünler
              </p>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => {
                  const firstImage =
                    relatedProduct.images?.[0] || '/placeholder.jpg';

                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/urun/${relatedProduct.id}`}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="cursor-pointer overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-sm transition-all hover:shadow-xl"
                      >
                        <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
                          <Image
                            src={firstImage}
                            alt={relatedProduct.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute left-3 top-3">
                            <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f3f44] shadow-sm backdrop-blur-sm">
                              {relatedProduct.material}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-1 text-xs font-light uppercase tracking-wider text-[#999]">
                            {relatedProduct.family}
                          </div>
                          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a]">
                            {relatedProduct.title}
                          </h3>
                          <div className="text-base font-semibold text-[#0f3f44]">
                            {relatedProduct.price}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-12 text-center">
                <p className="text-sm text-[#999]">
                  Şu an ilgili ürün bulunmamaktadır.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Recently Viewed Products */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
