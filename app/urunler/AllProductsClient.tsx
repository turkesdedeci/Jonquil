"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SlidersHorizontal, Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStock } from '@/contexts/StockContext';

interface Product {
  id: string;
  collection: string;
  family: string;
  images?: string[];
  title: string;
  subtitle: string;
  color: string;
  price: string;
  material: string;
  productType: string;
  size: string;
  tags: string[];
}

interface AllProductsClientProps {
  products: Product[];
}

export default function AllProductsClient({ products }: AllProductsClientProps) {
  const { isInStock } = useStock();
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique values for filters
  const collections = useMemo(() => {
    const cols = new Set(products.map((p) => p.collection));
    return Array.from(cols);
  }, [products]);

  const productTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.productType));
    return Array.from(types);
  }, [products]);

  // Parse price from string
  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.subtitle.toLowerCase().includes(query) ||
          p.family.toLowerCase().includes(query) ||
          p.color.toLowerCase().includes(query)
      );
    }

    // Filter by collection
    if (filterCollection !== 'all') {
      result = result.filter((p) => p.collection === filterCollection);
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((p) => p.productType === filterType);
    }

    // Sort
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
  }, [products, sortBy, filterCollection, filterType, searchQuery]);

  // Collection display names
  const collectionNames: Record<string, string> = {
    aslan: 'Aslan Koleksiyonu',
    ottoman: 'Ottoman Koleksiyonu',
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterCollection('all');
    setFilterType('all');
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters =
    filterCollection !== 'all' ||
    filterType !== 'all' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'default';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0f3f44] via-[#1a5a5f] to-[#0f3f44] py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="mb-4 text-xs font-light uppercase tracking-[0.3em] text-[#d4af7a]">
                Koleksiyonlar
              </p>
              <h1 className="mb-6 font-serif text-5xl font-light md:text-6xl">
                Tüm Ürünler
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-white/80">
                El yapımı porselen koleksiyonlarımızı keşfedin. Her parça özenle
                tasarlanmış, geleneksel zanaatkarlık ile modern estetiği
                buluşturuyor.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="sticky top-20 z-10 border-b border-[#e8e6e3] bg-[#faf8f5] shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full rounded-full border border-[#e8e6e3] bg-white py-3 pl-12 pr-12 text-sm text-[#1a1a1a] placeholder-[#999] focus:border-[#0f3f44] focus:outline-none focus:ring-2 focus:ring-[#0f3f44]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left: Product Count */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#666]">
                  {filteredProducts.length} ürün
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#0f3f44] underline hover:text-[#d4af7a]"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>

              {/* Center: Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Collection Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#999]" />
                  <select
                    value={filterCollection}
                    onChange={(e) => setFilterCollection(e.target.value)}
                    className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0f3f44] focus:outline-none"
                  >
                    <option value="all">Tüm Koleksiyonlar</option>
                    {collections.map((col) => (
                      <option key={col} value={col}>
                        {collectionNames[col] || col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-lg border border-[#e8e6e3] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0f3f44] focus:outline-none"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#999]" />
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
              </div>

              {/* Right: View Mode */}
              <div className="flex items-center gap-2">
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
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6">
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => {
                  const inStock = isInStock(product.id);
                  const firstImage = product.images?.[0] || '/placeholder.jpg';

                  return (
                    <Link key={product.id} href={`/urun/${product.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        whileHover={{ y: -4 }}
                        className={`group cursor-pointer overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-sm transition-all hover:shadow-xl ${
                          !inStock ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
                          <Image
                            src={firstImage}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                              !inStock ? 'grayscale' : ''
                            }`}
                            loading={index < 12 ? 'eager' : 'lazy'}
                          />

                          {/* Material Badge */}
                          <div className="absolute left-3 top-3">
                            <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f3f44] shadow-sm backdrop-blur-sm">
                              {product.material}
                            </div>
                          </div>

                          {/* Out of Stock Badge */}
                          {!inStock && (
                            <div className="absolute right-3 top-3">
                              <div className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                                Tükendi
                              </div>
                            </div>
                          )}

                          {/* Collection Badge */}
                          <div className="absolute bottom-3 left-3">
                            <div className="rounded-full bg-[#0f3f44]/80 px-2 py-1 text-[10px] font-medium capitalize text-white backdrop-blur-sm">
                              {product.collection}
                            </div>
                          </div>

                          {/* Size Badge */}
                          {product.size && (
                            <div className="absolute bottom-3 right-3">
                              <div className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                {product.size}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="mb-1 text-xs font-light uppercase tracking-wider text-[#d4af7a]">
                            {product.family}
                          </div>
                          <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a]">
                            {product.title}
                          </h3>
                          <p className="mb-2 text-xs text-[#666]">
                            {product.subtitle}
                          </p>
                          <div className="text-base font-semibold text-[#0f3f44]">
                            {product.price}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredProducts.map((product, index) => {
                  const inStock = isInStock(product.id);
                  const firstImage = product.images?.[0] || '/placeholder.jpg';

                  return (
                    <Link key={product.id} href={`/urun/${product.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        className={`group flex gap-6 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-sm transition-all hover:shadow-lg ${
                          !inStock ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-[#faf8f5]">
                          <Image
                            src={firstImage}
                            alt={product.title}
                            fill
                            sizes="128px"
                            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                              !inStock ? 'grayscale' : ''
                            }`}
                            loading={index < 12 ? 'eager' : 'lazy'}
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                          <div className="mb-1 text-xs font-light uppercase tracking-wider text-[#d4af7a]">
                            {product.family}
                          </div>
                          <h3 className="mb-1 text-lg font-medium text-[#1a1a1a]">
                            {product.title}
                          </h3>
                          <p className="mb-2 text-sm text-[#666]">
                            {product.subtitle}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-[#0f3f44]">
                              {product.price}
                            </span>
                            {!inStock && (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                                Stokta Yok
                              </span>
                            )}
                            <span className="text-xs capitalize text-[#999]">
                              {product.collection} · {product.material} · {product.size}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
