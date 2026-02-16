"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
  variants?: Product[];
  selectedVariantIndex?: number;
}

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

const PRODUCT_IMAGE_QUALITY = 95;
const PRODUCT_THUMB_QUALITY = 85;

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const [storyWidth, setStoryWidth] = useState(0);

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
  const normalizedCapacity =
    (currentVariant?.capacity || product.capacity || '').trim();
  const normalizedSize =
    (currentVariant?.size || product.size || '').trim();
  const normalizedSetType =
    (currentVariant?.setSingle || product.setSingle || '').trim();
  const sizeBadge =
    normalizedCapacity ||
    normalizedSize ||
    (normalizedSetType && !normalizedSetType.toLocaleLowerCase('tr-TR').startsWith('tek par')
      ? normalizedSetType
      : '');
  const displayPrice = currentVariant?.price || product.price;
  const fallbackDescription = `Jonquil Studio imzal\u0131 bu par\u00e7a, el i\u015f\u00e7ili\u011fi ve \u00f6zenli \u00fcretimle haz\u0131rlanan koleksiyonun \u00f6zg\u00fcn bir \u00fcyesidir.`;
  const productDescription =
    (currentVariant?.description || product.description || '').trim() || fallbackDescription;

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

  useEffect(() => {
    const updateWidth = () => setStoryWidth(storyRef.current?.clientWidth || 0);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (storyRef.current && storyWidth > 0) {
      storyRef.current.scrollTo({
        left: activeImageIndex * storyWidth,
        behavior: 'smooth',
      });
    }
  }, [activeImageIndex, storyWidth]);

  const handleStoryScroll = () => {
    if (!storyRef.current || !storyWidth) return;
    const idx = Math.round(storyRef.current.scrollLeft / storyWidth);
    if (idx !== activeImageIndex) {
      setActiveImageIndex(Math.max(0, Math.min(images.length - 1, idx)));
    }
  };


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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-12 sm:pb-12">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#0f3f44] sm:mb-8"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Geri Dön
          </button>

          <div className="grid gap-6 lg:gap-12 lg:grid-cols-2">
            {/* LEFT: Image Gallery */}
            <div className="min-w-0 space-y-3 sm:space-y-4">
              {/* Mobile Story-style Gallery */}
              {images.length > 0 && (
                <div className="sm:hidden">
                  <div
                    ref={storyRef}
                    onScroll={handleStoryScroll}
                    className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-[#faf8f5]"
                  >
                    {images.map((img: string, idx: number) => (
                      <button
                        key={`story-${idx}`}
                        onClick={() => {
                          setZoomIndex(idx);
                          setIsZoomOpen(true);
                        }}
                        className="relative aspect-square min-w-full snap-center"
                      >
                        <Image
                          src={img}
                          alt={product.title}
                          fill
                          sizes="100vw"
                          quality={PRODUCT_IMAGE_QUALITY}
                          className="object-cover"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                        {sizeBadge && (
                          <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#0f3f44] shadow-sm ring-1 ring-[#0f3f44]/10 backdrop-blur-sm">
                            {sizeBadge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      {images.map((_, idx) => (
                        <span
                          key={`dot-${idx}`}
                          className={`h-1.5 w-1.5 rounded-full ${
                            idx === activeImageIndex ? 'bg-[#0f3f44]' : 'bg-[#d9d6d1]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Main Image */}
              <motion.div
                className="relative hidden aspect-square w-full overflow-hidden rounded-2xl bg-[#faf8f5] sm:block sm:rounded-3xl cursor-zoom-in"
                layoutId={`product-${product.id}`}
              >
                {images.map((img: string, idx: number) => (
                  <button
                    key={`${selectedVariantIndex}-${idx}`}
                    onClick={() => {
                      setZoomIndex(idx);
                      setIsZoomOpen(true);
                    }}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      idx === activeImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-label="Görseli büyüt"
                  >
                    <Image
                      src={img}
                      alt={product.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={PRODUCT_IMAGE_QUALITY}
                      className="object-cover"
                      priority={idx === 0}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </button>
                ))}

                {sizeBadge && (
                  <div className="absolute right-4 top-4 rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0f3f44] shadow-sm ring-1 ring-[#0f3f44]/10 backdrop-blur-sm">
                    {sizeBadge}
                  </div>
                )}

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
                <div className="hidden -mx-4 gap-2 overflow-x-auto px-4 pb-2 sm:flex sm:mx-0 sm:gap-3 sm:px-0">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 sm:rounded-xl ${
                        activeImageIndex === index
                          ? 'border-[#0f3f44] ring-2 ring-[#0f3f44]/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} - Görsel ${index + 1}`}
                        fill
                        sizes="80px"
                        quality={PRODUCT_THUMB_QUALITY}
                        className="object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info */}
            <div className="min-w-0 space-y-4 sm:space-y-6">
              {/* Brand/Family */}
              <div className="text-xs font-light uppercase tracking-[0.2em] text-[#d4af7a]">
                {product.family}
              </div>

              {/* Product Title */}
              <h1 className="break-words font-serif text-2xl font-light leading-tight text-[#1a1a1a] sm:text-4xl">
                {product.title}
              </h1>

              {/* Subtitle */}
              <p className="break-words text-sm text-[#666]">
                {currentVariant ? currentVariant.subtitle : product.subtitle}
              </p>

              {/* Price */}
              <div className="text-2xl font-semibold text-[#0f3f44] sm:text-3xl">
                {displayPrice}
              </div>

              {/* Color Selector - Moved up for mobile visibility */}
              {hasVariants && (
                <>
                  <div className="border-t border-[#e8e6e3] pt-4 sm:pt-6" />
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
                          <div className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {variant.color}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-[#e8e6e3] pt-4 sm:pt-6" />

              {/* Quantity Selector */}
              <div>
                <div className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                  Miktar
                </div>
                <div className="inline-flex items-center gap-4 rounded-full border border-[#e8e6e3] px-4 py-2 sm:px-6 sm:py-3">
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
                  className={`hidden min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all active:scale-98 disabled:opacity-70 sm:flex sm:gap-3 sm:px-8 sm:py-4 ${
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
                  className={`hidden min-h-[44px] w-full items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-sm font-semibold transition-all active:scale-98 sm:flex sm:gap-3 sm:px-8 sm:py-4 ${
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
                        <p className="text-sm leading-relaxed text-[#666]">{productDescription}</p>
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
                              {sizeBadge || '-'}
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
          <section className="mt-12 border-t border-[#e8e6e3] pt-12 sm:mt-20 sm:pt-20">
            <div className="mb-6 sm:mb-12">
              <h2 className="mb-2 text-center font-serif text-2xl font-light text-[#1a1a1a] sm:mb-3 sm:text-3xl">
                İlgili Ürünler
              </h2>
              <p className="text-center text-xs text-[#666] sm:text-sm">
                Beğenebileceğiniz diğer ürünler
              </p>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => {
                  const firstImage =
                    relatedProduct.images?.[0] || '/placeholder.jpg';
                  const disableOptimization =
                    typeof firstImage === 'string' &&
                    firstImage.startsWith('/images/products/');

                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/urun/${relatedProduct.id}`}
                      className="group w-[160px] flex-shrink-0 sm:w-auto"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="cursor-pointer overflow-hidden rounded-xl border border-[#e8e6e3] bg-white shadow-sm transition-all hover:shadow-xl sm:rounded-2xl"
                      >
                        <div className="relative aspect-square overflow-hidden bg-white">
                          <Image
                            src={firstImage}
                            alt={relatedProduct.title}
                            fill
                            sizes="(max-width: 640px) 160px, (max-width: 1024px) 50vw, 25vw"
                            quality={100}
                            unoptimized={disableOptimization}
                            className="object-contain bg-white transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="mb-1 line-clamp-2 text-xs font-medium leading-snug text-[#1a1a1a] sm:mb-2 sm:text-sm">
                            {relatedProduct.title}
                          </h3>
                          <div className="text-sm font-semibold text-[#0f3f44] sm:text-base">
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e6e3] bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8b8b8b]">
              {inStock ? 'Fiyat' : 'Durum'}
            </p>
            <p className="truncate text-lg font-semibold text-[#0f3f44]">
              {inStock ? displayPrice : 'Yakında'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addedToCart || !inStock}
            className={`min-h-[44px] flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white transition-colors ${
              inStock
                ? 'bg-[#0f3f44] hover:bg-[#0a2a2e]'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            {!inStock ? (
              <span className="inline-flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Stokta Yok
              </span>
            ) : addedToCart ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4" />
                Sepete Eklendi!
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Sepete Ekle
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Recently Viewed Products */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsZoomOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white">
                <Image
                  src={images[zoomIndex] || '/placeholder.jpg'}
                  alt={product.title}
                  fill
                  sizes="100vw"
                  quality={PRODUCT_IMAGE_QUALITY}
                  className="object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"
                      aria-label="Önceki görsel"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"
                      aria-label="Sonraki görsel"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                      {zoomIndex + 1} / {images.length}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
