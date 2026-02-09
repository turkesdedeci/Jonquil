'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useProducts, Product } from '@/hooks/useProducts';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onProductClick: (product: any) => void;
}

export default function SearchModal({ open, onClose, onProductClick }: SearchModalProps) {
  const { products: allProducts } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [lastSearchMs, setLastSearchMs] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const levenshtein = (a: string, b: string) => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };
  const normalizeImageSrc = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    return `/${src}`;
  };

  const searchIndex = useMemo(() => {
    return allProducts.map(product => {
      const searchableText = normalizeText([
        product.title,
        product.subtitle,
        product.collection,
        product.family,
        product.productType,
        product.color,
        product.material,
        ...(product.tags || [])
      ].join(' '));
      const tokens = searchableText.split(' ').filter(Boolean);
      return { product, searchableText, tokens };
    });
  }, [allProducts]);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLastSearchMs(null);
      return;
    }

    const searchTerm = normalizeText(query);
    const startTime = performance.now();
    const filtered = searchIndex
      .filter(({ searchableText, tokens }) => {
        if (searchableText.includes(searchTerm)) return true;

        return tokens.some(token => {
          if (!token) return false;
          if (token.startsWith(searchTerm)) return true;
          if (searchTerm.length <= 3) return false;
          return levenshtein(token, searchTerm) <= 2;
        });
      })
      .map(({ product }) => product);

    // Limit to 10 results
    const endTime = performance.now();
    setLastSearchMs(Math.round(endTime - startTime));
    setResults(filtered.slice(0, 10));
  }, [query, searchIndex]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) {
          // This would need to be handled by parent
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleProductClick = (product: any) => {
    onProductClick(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-24 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Ürün arama"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center border-b border-[#e8e6e3] p-4">
                <Search className="mr-3 h-5 w-5 text-[#999]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ürün ara... (tabak, fincan, aslan, ottoman...)"
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-[#999]"
                  aria-label="Ürün ara"
                  aria-describedby="search-results-info"
                />
                <button
                  onClick={onClose}
                  className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#666] hover:bg-[#e8e6e3]"
                  aria-label="Aramayı kapat"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-[#999]">"{query}" için sonuç bulunamadı</p>
                    <p className="mt-2 text-sm text-[#ccc]">Farklı bir arama terimi deneyin</p>
                  </div>
                )}

                {results.length > 0 && (
                  <ul className="p-2" role="listbox" aria-label="Arama sonuçları">
                    {results.map((product) => (
                      <li key={product.id} role="option">
                        <button
                          onClick={() => handleProductClick(product)}
                          className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-[#faf8f5]"
                          aria-label={`${product.title} - ${product.price}`}
                        >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
                          {product.images?.[0] && (
                            <Image
                              src={normalizeImageSrc(product.images[0])}
                              alt={product.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1a1a1a] truncate">{product.title}</p>
                          <p className="text-sm text-[#666] truncate">{product.subtitle}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-[#0f3f44]/10 px-2 py-0.5 text-xs font-medium text-[#0f3f44]">
                              {product.collection === 'aslan' ? 'Aslan' : 'Ottoman'}
                            </span>
                            <span className="text-xs text-[#999]">{product.productType}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-[#0f3f44]">{product.price}</p>
                          <ArrowRight className="ml-auto mt-1 h-4 w-4 text-[#999]" aria-hidden="true" />
                        </div>
                      </button>
                      </li>
                    ))}
                  </ul>
                )}

                {!query && (
                  <div className="p-6">
                    <p className="mb-4 text-sm font-medium text-[#666]">Popüler Aramalar</p>
                    <div className="flex flex-wrap gap-2">
                      {['Tabak', 'Fincan', 'Mumluk', 'Aslan', 'Ottoman', 'Kırmızı', 'Yeşil'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-[#e8e6e3] px-4 py-2 text-sm text-[#666] transition-colors hover:border-[#0f3f44] hover:text-[#0f3f44]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#e8e6e3] bg-[#faf8f5] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-[#999]">
                  <span id="search-results-info" aria-live="polite">
                    {results.length > 0 && `${results.length} sonuç bulundu`}
                    {query && results.length === 0 && 'Sonuç bulunamadı'}
                  </span>
                  <span className="hidden sm:block">
                    <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm">ESC</kbd>
                    {' '}kapatmak için
                  </span>
                </div>
                {lastSearchMs !== null && (
                  <div className="mt-1 text-[11px] text-[#bbb]">
                    Arama süresi: {lastSearchMs} ms
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
