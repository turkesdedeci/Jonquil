'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Get or create an anonymous session ID for abandoned cart tracking
function getCartSessionId(): string {
  const key = 'jonquil-cart-session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  color: string;
  price: string;
  image: string;
  quantity: number;
  material: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearCartAfterOrder: () => void; // marks cart as converted then clears
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jonquil-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (error) {
        console.error('Cart load error:', error);
      }
    }
    setMounted(true);
  }, []);

  // Debounced sync to server for abandoned cart tracking (fire-and-forget)
  const syncToServer = useCallback((currentItems: CartItem[], currentTotal: number) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const sessionId = getCartSessionId();
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, items: currentItems, totalAmount: currentTotal }),
      }).catch(() => {}); // silent
    }, 2000); // 2s debounce
  }, []);

  // Save to localStorage on change + sync to server
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('jonquil-cart', JSON.stringify(items));
      const total = items.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(price) ? 0 : price) * item.quantity;
      }, 0);
      syncToServer(items, total);
    }
  }, [items, mounted, syncToServer]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      // Aynı ürün varsa quantity artır
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      // Yoksa yeni ekle
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearCartAfterOrder = () => {
    // Mark as converted on server before clearing
    const sessionId = getCartSessionId();
    fetch(`/api/cart?sessionId=${encodeURIComponent(sessionId)}`, { method: 'DELETE' }).catch(() => {});
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9]/g, ''));
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCartAfterOrder,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}