"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilterSection from '@/components/FilterSection';
import { useStock } from '@/contexts/StockContext';

interface Product {
  id: string;
  collection: string;
  family: string;
  images?: string[];
  title: string;
  subtitle: string | null;
  color: string | null;
  price: string;
  material: string | null;
  productType: string | null;
  size?: string | null;
  capacity?: string | null;
  setSingle?: string | null;
  tags: string[];
}

interface CategoryPageClientProps {
  slug: string;
  name: string;
  description: string;
  products: Product[];
}

const getMeasurementLabel = (product: Product): string => {
  const capacity = (product.capacity || '').trim();
  if (capacity) return capacity;

  const size = (product.size || '').trim();
  if (size) return size;

  const setSingle = (product.setSingle || '').trim();
  if (setSingle && !setSingle.toLocaleLowerCase('tr-TR').startsWith('tek par')) return setSingle;

  return '';
};

function ProductImage({
  src,
  alt,
  sizes,
  className,
  loading,
}: {
  src: string;
  alt: string;
  sizes: string;
  className: string;
  loading: 'eager' | 'lazy';
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#ece8e4]" aria-hidden="true" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export default function CategoryPageClient({
  name,
  description,
  products,
}: CategoryPageClientProps) {
  const { isInStock } = useStock();
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [filterCollection, setFilterCollection] = useState<string[]>([]);
  const [filterColor, setFilterColor] = useState<string[]>([]);
  const [filterMaterial, setFilterMaterial] = useState<string[]>([]);
  const [filterSize, setFilterSize] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const mobileFiltersPanelRef = useRef<HTMLDivElement>(null);

  // Get unique values for filters
  const collections = useMemo(() => {
    return [...new Set(products.map((p) => p.collection))].filter(Boolean);
  }, [products]);

  const colors = useMemo(() => {
    return [...new Set(products.map((p) => (p.color || '').trim()))].filter(
      (value): value is string => Boolean(value)
    );
  }, [products]);

  const materials = useMemo(() => {
    return [...new Set(products.map((p) => (p.material || '').trim()))].filter(
      (value): value is string => Boolean(value)
    );
  }, [products]);

  const sizes = useMemo(() => {
    return [...new Set(products.map((p) => getMeasurementLabel(p)))].filter(Boolean);
  }, [products]);

  // Parse price from string
  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  };

  // Toggle filter helper
  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(v => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  // Collection display names
  const collectionNames: Record<string, string> = {
    aslan: 'Aslan',
    ottoman: 'Ottoman',
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filterCollection.length > 0) {
      result = result.filter((p) => filterCollection.includes(p.collection));
    }
    if (filterColor.length > 0) {
      result = result.filter((p) => filterColor.includes((p.color || '').trim()));
    }
    if (filterMaterial.length > 0) {
      result = result.filter((p) => filterMaterial.includes((p.material || '').trim()));
    }
    if (filterSize.length > 0) {
      result = result.filter((p) => filterSize.includes(getMeasurementLabel(p)));
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        break;
      default:
        break;
    }

    return result;
  }, [products, sortBy, filterCollection, filterColor, filterMaterial, filterSize]);

  const clearFilters = () => {
    setFilterCollection([]);
    setFilterColor([]);
    setFilterMaterial([]);
    setFilterSize([]);
    setSortBy('default');
  };

  const hasActiveFilters =
    filterCollection.length > 0 ||
    filterColor.length > 0 ||
    filterMaterial.length > 0 ||
    filterSize.length > 0;

  const renderFiltersContent = () => (
    <div className="space-y-4">
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8e6e3] py-2 text-sm font-medium text-[#666] hover:bg-[#faf8f5]"
        >
          <X className="h-4 w-4" />
          Filtreleri Temizle
        </button>
      )}

      <FilterSection
        title="Koleksiyon"
        items={collections}
        selected={filterCollection}
        onToggle={(v) => toggleFilter(filterCollection, setFilterCollection, v)}
        displayNames={collectionNames}
      />

      <FilterSection
        title="Renk"
        items={colors}
        selected={filterColor}
        onToggle={(v) => toggleFilter(filterColor, setFilterColor, v)}
      />

      <FilterSection
        title="Malzeme"
        items={materials}
        selected={filterMaterial}
        onToggle={(v) => toggleFilter(filterMaterial, setFilterMaterial, v)}
      />

      <FilterSection
        title="Boyut"
        items={sizes}
        selected={filterSize}
        onToggle={(v) => toggleFilter(filterSize, setFilterSize, v)}
      />
    </div>
  );

  useEffect(() => {
    if (!showMobileFilters) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocusedElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    mobileFiltersPanelRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowMobileFilters(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
      previousFocusedElement?.focus();
    };
  }, [showMobileFilters]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0f3f44] via-[#1a5a5f] to-[#0f3f44] py-10 text-white sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-[11px] font-light uppercase tracking-[0.28em] text-[#d4af7a] sm:mb-4 sm:text-xs">
                Kategori
              </p>
              <h1 className="mb-3 font-serif text-3xl font-light sm:mb-5 sm:text-5xl md:text-6xl">
                {name}
              </h1>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/80 sm:text-lg">
                {description}
              </p>
            </div>
          </div>
        </section>

        {/* Top Bar */}
        <section className="border-b border-[#e8e6e3] bg-[#faf8f5]">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#666]">
                  {filteredProducts.length} ürün
                </span>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-sm font-medium text-[#1a1a1a] lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filtrele
                  {hasActiveFilters && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3f44] text-xs text-white">
                      {filterCollection.length + filterColor.length + filterMaterial.length + filterSize.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="hidden h-4 w-4 text-[#999] sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0f3f44] focus:outline-none"
                  >
                    <option value="default">Varsayılan</option>
                    <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="name">İsim: A-Z</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#0f3f44] text-white'
                        : 'bg-white text-[#666] hover:bg-[#e8e6e3]'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#0f3f44] text-white'
                        : 'bg-white text-[#666] hover:bg-[#e8e6e3]'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-24">
                  <h3 className="mb-4 text-lg font-semibold text-[#1a1a1a]">Filtreler</h3>
                  {renderFiltersContent()}
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-12 text-center">
                    <p className="mb-4 text-lg text-[#666]">Ürün bulunamadı.</p>
                    <button
                      onClick={clearFilters}
                      className="rounded-full bg-[#0f3f44] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e]"
                    >
                      Filtreleri Temizle
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 1200px' }}
                  >
                    {filteredProducts.map((product, index) => {
                      const inStock = isInStock(product.id);
                      const firstImage = product.images?.[0] || '/placeholder.jpg';
                      const badgeLabel = inStock ? getMeasurementLabel(product) : 'Yak1nda';

                      return (
                        <Link key={product.id} href={`/urun/${product.id}`} className="block h-full">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.35) }}
                            whileHover={{ y: -4 }}
                            className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#789d94] bg-[#d3e5df] shadow-[0_8px_18px_rgba(10,70,62,0.16)] transition-all hover:shadow-[0_16px_30px_rgba(10,70,62,0.24)] sm:rounded-2xl ${
                              !inStock ? 'opacity-80' : ''
                            }`}
                          >
                            <div className="relative h-44 overflow-hidden bg-[#faf8f5] p-2 sm:h-52 sm:p-2.5">
                              <div className="relative h-full w-full overflow-hidden rounded-lg sm:rounded-xl">
                                <ProductImage
                                  src={firstImage}
                                  alt={product.title}
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  loading={index < 4 ? 'eager' : 'lazy'}
                                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                                    !inStock ? 'grayscale' : ''
                                  }`}
                                />
                              </div>

                              {badgeLabel && (
                                <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                                  <div
                                    className={`max-w-[110px] truncate rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ring-1 backdrop-blur-sm sm:max-w-[120px] sm:px-3 sm:py-1.5 ${
                                      inStock
                                        ? 'bg-white/95 text-[#0f3f44] ring-[#0f3f44]/10'
                                        : 'bg-red-500 text-white ring-red-300/30'
                                    }`}
                                  >
                                    {badgeLabel}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex min-h-[142px] flex-1 flex-col p-3 sm:min-h-[156px] sm:p-4">
                              <div className="mb-1 text-[10px] font-light uppercase tracking-[0.16em] text-[#d4af7a] sm:text-xs">
                                {product.family}
                              </div>
                              <h3 className="mb-1 line-clamp-2 min-h-[2.3rem] text-[13px] font-medium leading-snug text-[#13373c] sm:min-h-[2.6rem] sm:text-sm">
                                {product.title}
                              </h3>
                              <p className="mb-2 line-clamp-2 min-h-[2.2rem] text-[11px] text-[#4d6769] sm:line-clamp-1 sm:min-h-[1.2rem] sm:text-xs">
                                {product.subtitle || ''}
                              </p>
                              <div className="mt-auto text-base font-semibold text-[#0e4550]">
                                {product.price}
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4" style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 900px' }}>
                    {filteredProducts.map((product, index) => {
                      const inStock = isInStock(product.id);
                      const firstImage = product.images?.[0] || '/placeholder.jpg';
                      const badgeLabel = inStock ? getMeasurementLabel(product) : 'Yak1nda';

                      return (
                        <Link key={product.id} href={`/urun/${product.id}`}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.02, 0.28) }}
                            className={`group flex gap-4 overflow-hidden rounded-2xl border border-[#789d94] bg-[#d3e5df] p-3 shadow-[0_8px_18px_rgba(10,70,62,0.16)] transition-all hover:shadow-[0_16px_30px_rgba(10,70,62,0.24)] sm:gap-6 sm:p-4 ${
                              !inStock ? 'opacity-80' : ''
                            }`}
                          >
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#faf8f5] p-1.5 sm:h-32 sm:w-32 sm:p-2">
                              <div className="relative h-full w-full overflow-hidden rounded-[10px] sm:rounded-lg">
                                <ProductImage
                                  src={firstImage}
                                  alt={product.title}
                                  sizes="128px"
                                  loading={index < 3 ? 'eager' : 'lazy'}
                                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                                    !inStock ? 'grayscale' : ''
                                  }`}
                                />
                              </div>
                              {badgeLabel && (
                                <div
                                  className={`absolute right-1.5 top-1.5 max-w-[72px] truncate rounded-full px-1.5 py-0.5 text-[8px] font-semibold shadow-sm ring-1 sm:right-2 sm:top-2 sm:max-w-[94px] sm:px-2.5 sm:py-1 sm:text-[10px] ${
                                    inStock
                                      ? 'bg-white/95 text-[#0f3f44] ring-[#0f3f44]/10'
                                      : 'bg-red-500 text-white ring-red-300/30'
                                  }`}
                                >
                                  {badgeLabel}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                              <div className="mb-1 text-[10px] font-light uppercase tracking-[0.16em] text-[#d4af7a] sm:text-xs">
                                {product.family}
                              </div>
                              <h3 className="mb-1 line-clamp-2 text-sm font-medium text-[#13373c] sm:text-base">
                                {product.title}
                              </h3>
                              <p className="mb-2 line-clamp-1 text-xs text-[#4d6769] sm:text-sm">
                                {product.subtitle || ''}
                              </p>
                              <div className="text-base font-semibold text-[#0e4550] sm:text-lg">
                                {product.price}
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-mobile-filters-title"
              tabIndex={-1}
              ref={mobileFiltersPanelRef}
            >
              <div className="flex items-center justify-between border-b border-[#e8e6e3] px-4 py-4 sm:px-6">
                <h3 id="category-mobile-filters-title" className="text-base font-semibold text-[#1a1a1a] sm:text-lg">Filtreler</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#1a1a1a] hover:bg-[#e8e6e3]"
                  aria-label="Filtre panelini kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[calc(85vh-148px)] overflow-y-auto px-4 py-4 sm:px-6">
                {renderFiltersContent()}
              </div>
              <div className="sticky bottom-0 flex items-center gap-3 border-t border-[#e8e6e3] bg-white px-4 py-3 sm:px-6">
                <button
                  onClick={clearFilters}
                  className="min-h-[44px] flex-1 rounded-full border border-[#d9d6d1] px-4 text-sm font-semibold text-[#4b4b4b] hover:bg-[#faf8f5]"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-[44px] flex-1 rounded-full bg-[#0f3f44] px-4 text-sm font-semibold text-white hover:bg-[#0a2a2e]"
                >
                  Uygula ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}


