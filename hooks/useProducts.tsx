'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { allProducts as staticProducts } from '@/data/products';

export interface Product {
  id: string;
  collection: string;
  family: string;
  images: string[];
  title: string;
  subtitle: string | null;
  color: string | null;
  code: string | null;
  size: string | null;
  price: string;
  material: string;
  productType: string | null;
  usage: string | null;
  capacity: string | null;
  setSingle: string;
  tags: string[];
  inStock: boolean;
  isFromDatabase: boolean;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCollection: (collection: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    staticProducts.map(p => ({ ...p, inStock: true, isFromDatabase: false } as Product))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep using static products as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const getProductsByCollection = (collection: string) => {
    return products.filter(p => p.collection.toLowerCase() === collection.toLowerCase());
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.productType?.toLowerCase() === category.toLowerCase());
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: fetchProducts,
        getProductById,
        getProductsByCollection,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

// For backwards compatibility - returns all products with stock status
export function useAllProducts() {
  const { products, loading } = useProducts();
  return { allProducts: products, loading };
}
