'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!open || items.length === 0) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const loadSuggestions = async () => {
      try {
        const { allProducts } = await import('@/data/products');
        const base = allProducts.find((p: any) => p.id === items[0]?.productId);
        const sameCollection = base
          ? allProducts.filter((p: any) => p.collection === base.collection && p.id !== base.id)
          : allProducts;
        if (active) {
          setSuggestions(sameCollection.slice(0, 3));
        }
      } catch {
        if (active) setSuggestions([]);
      }
    };
    loadSuggestions();
    return () => {
      active = false;
    };
  }, [open, items]);

  return (
    <>
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8e6e3] p-6">
              <div>
                <h2 id="cart-title" className="font-serif text-2xl font-light text-[#1a1a1a]">
                  Sepetim
                </h2>
                <p className="text-sm text-[#666]">{totalItems} ürün</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1a1a1a] hover:bg-[#e8e6e3]"
                aria-label="Sepeti kapat"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-16 w-16 text-[#e8e6e3]" />
                  <p className="mb-2 font-medium text-[#1a1a1a]">Sepetiniz boş</p>
                  <p className="mb-6 text-sm text-[#666]">
                    Ürün eklemek için koleksiyonumuzu keşfedin
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      router.push('/urunler');
                    }}
                    className="rounded-lg bg-[#0f3f44] px-6 py-3 font-medium text-white hover:bg-[#0a2a2e]"
                  >
                    Ürünlere Göz At
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-4"
                    >
                      {/* Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col">
                        <div className="mb-2">
                          <h3 className="text-sm font-medium text-[#1a1a1a]">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#666]">{item.subtitle}</p>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2" role="group" aria-label="Miktar">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e6e3] text-[#666] hover:bg-white"
                              aria-label={`${item.title} miktarını azalt`}
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-[#1a1a1a]" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e6e3] text-[#666] hover:bg-white"
                              aria-label={`${item.title} miktarını artır`}
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[#1a1a1a]">
                              {item.price}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-red-600 hover:underline"
                              aria-label={`${item.title} ürününü sepetten kaldır`}
                            >
                              Kaldır
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {suggestions.length > 0 && (
                    <div className="rounded-xl border border-[#e8e6e3] bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Sana Özel Öneriler</h4>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {suggestions.map((product) => (
                          <Link
                            key={product.id}
                            href={`/urun/${product.id}`}
                            onClick={onClose}
                            className="group rounded-lg border border-[#e8e6e3] p-2 hover:border-[#0f3f44]/40"
                          >
                            <div className="relative mb-2 aspect-square overflow-hidden rounded-md bg-[#faf8f5]">
                              <Image
                                src={product.images?.[0] || '/placeholder.jpg'}
                                alt={product.title}
                                fill
                                sizes="96px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                            <div className="text-[11px] font-medium text-[#1a1a1a] line-clamp-2">
                              {product.title}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-[#0f3f44]">
                              {product.price}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#e8e6e3] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[#666]">Ara Toplam</span>
                  <span className="font-serif text-xl font-medium text-[#1a1a1a]">
                    {totalPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full rounded-lg bg-[#0f3f44] py-3 font-medium text-white hover:bg-[#0a2a2e]"
                >
                  Siparişi Tamamla
                </button>
                <button
                  onClick={onClose}
                  className="mt-3 w-full rounded-lg border border-[#e8e6e3] bg-white py-3 font-medium text-[#0f3f44] hover:bg-[#faf8f5]"
                >
                  Alışverişe Devam Et
                </button>
                <p className="mt-3 text-center text-xs text-[#666]">
                  Kargo ücreti ödeme adımında hesaplanacaktır
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
