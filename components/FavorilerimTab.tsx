'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { allProducts } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

export function FavorilerimTab() {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  useEffect(() => {
    // Favori ürünleri bul
    const products = favorites
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
    setFavoriteProducts(products);
  }, [favorites]);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      subtitle: product.subtitle || product.color,
      color: product.color,
      price: product.price,
      image: product.images?.[0] || '/placeholder.jpg',
      material: product.material || 'Porselen',
    }, 1);
  };

  if (favoriteProducts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#e8e6e3] bg-[#faf8f5] p-12 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-[#e8e6e3]" />
        <p className="mb-2 font-medium text-[#1a1a1a]">Henüz favori yok</p>
        <p className="mb-4 text-sm text-[#666]">
          Beğendiğiniz ürünleri favorilerinize ekleyin
        </p>
        <button
          onClick={() => (window.location.hash = '#/urunler')}
          className="rounded-lg bg-[#0f3f44] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
        >
          Ürünleri Keşfet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Favorilerim</h2>
        <span className="text-sm text-[#666]">{favoriteProducts.length} ürün</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group overflow-hidden rounded-xl border border-[#e8e6e3] bg-white"
          >
            {/* Ürün Görseli */}
            <div
              className="relative aspect-square cursor-pointer overflow-hidden bg-[#faf8f5]"
              onClick={() => window.location.hash = `#/urun/${product.slug || product.id}/${product.id}`}
            >
              <Image
                src={product.images?.[0] || '/placeholder.jpg'}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Kaldır butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(product.id);
                }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-sm transition-all hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-4">
              <div className="mb-1 text-xs font-light uppercase tracking-wider text-[#999]">
                {product.family}
              </div>
              <h3
                className="mb-2 line-clamp-2 cursor-pointer text-sm font-medium text-[#1a1a1a] hover:text-[#0f3f44]"
                onClick={() => window.location.hash = `#/urun/${product.slug || product.id}/${product.id}`}
              >
                {product.title}
              </h3>

              <div className="mb-3 text-base font-semibold text-[#0f3f44]">
                {product.price}
              </div>

              {/* Sepete Ekle */}
              <button
                onClick={() => handleAddToCart(product)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e]"
              >
                <ShoppingCart className="h-4 w-4" />
                Sepete Ekle
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
