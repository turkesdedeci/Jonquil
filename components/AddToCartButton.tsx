'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useStock } from '@/contexts/StockContext';
import { ShoppingBag, Check, XCircle } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    subtitle: string;
    color: string;
    price: string;
    images: string[];
    material: string;
  };
  quantity?: number;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = 'primary',
  size = 'md'
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { isInStock } = useStock();
  const [added, setAdded] = useState(false);

  const inStock = isInStock(product.id);

  const handleClick = () => {
    if (!inStock) return;

    addToCart({
      id: product.id,
      productId: product.id,
      title: product.title,
      subtitle: product.subtitle,
      color: product.color,
      price: product.price,
      image: product.images[0],
      material: product.material,
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: inStock
      ? 'bg-[#0f3f44] text-white hover:bg-[#0a2a2e]'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    secondary: inStock
      ? 'border-2 border-[#0f3f44] text-[#0f3f44] hover:bg-[#0f3f44] hover:text-white'
      : 'border-2 border-gray-300 text-gray-400 cursor-not-allowed',
  };

  return (
    <button
      onClick={handleClick}
      disabled={added || !inStock}
      className={`
        flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all disabled:opacity-70
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {!inStock ? (
        <>
          <XCircle className="h-5 w-5" />
          Stokta Yok
        </>
      ) : added ? (
        <>
          <Check className="h-5 w-5" />
          Sepete Eklendi
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          Sepete Ekle
        </>
      )}
    </button>
  );
}