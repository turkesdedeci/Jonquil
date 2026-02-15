'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

interface RecentlyViewedProps {
  currentProductId?: string;
  maxItems?: number;
}

export function RecentlyViewed({ currentProductId, maxItems = 6 }: RecentlyViewedProps) {
  const { recentlyViewed } = useRecentlyViewed();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Filter out current product and limit items
  const displayItems = recentlyViewed
    .filter(p => p.id !== currentProductId)
    .slice(0, maxItems);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="py-12" aria-labelledby="recently-viewed-title">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3f44]/10">
              <Clock className="h-5 w-5 text-[#0f3f44]" aria-hidden="true" />
            </div>
            <h2 id="recently-viewed-title" className="font-serif text-2xl font-light text-[#1a1a1a]">
              Son Görüntülenenler
            </h2>
          </div>

          {/* Navigation Arrows */}
          {displayItems.length > 4 && (
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => scroll('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e6e3] text-[#666] hover:border-[#0f3f44] hover:text-[#0f3f44]"
                aria-label="Önceki ürünler"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e6e3] text-[#666] hover:border-[#0f3f44] hover:text-[#0f3f44]"
                aria-label="Sonraki ürünler"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Products Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="list"
          aria-label="Son görüntülenen ürünler"
        >
          {displayItems.map((product, index) => {
            const disableOptimization =
              typeof product.image === 'string' &&
              product.image.startsWith('/images/products/');

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                role="listitem"
              >
                <Link
                  href={`/urun/${product.id}`}
                  className="group block w-[200px] flex-shrink-0 overflow-hidden rounded-xl border border-[#e8e6e3] bg-white transition-all hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="200px"
                      quality={100}
                      unoptimized={disableOptimization}
                      className="object-contain bg-white transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Collection Badge */}
                    <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0f3f44] shadow-sm backdrop-blur-sm">
                      {product.collection === 'aslan' ? 'Aslan' : 'Ottoman'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="mb-1 line-clamp-1 text-sm font-medium text-[#1a1a1a] group-hover:text-[#0f3f44]">
                      {product.title}
                    </h3>
                    {product.subtitle && (
                      <p className="mb-2 line-clamp-1 text-xs text-[#666]">
                        {product.subtitle}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[#0f3f44]">
                      {product.price}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
