'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StockContextType {
  stockStatus: Record<string, boolean>;
  isLoaded: boolean;
  isInStock: (productId: string) => boolean;
  refreshStock: () => Promise<void>;
}

const StockContext = createContext<StockContextType>({
  stockStatus: {},
  isLoaded: false,
  isInStock: () => true,
  refreshStock: async () => {},
});

export function StockProvider({ children }: { children: ReactNode }) {
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadStockStatus = async () => {
    try {
      const res = await fetch('/api/products/stock');
      if (res.ok) {
        const data = await res.json();
        setStockStatus(data.stockStatus || {});
      }
    } catch (error) {
      console.error('Error loading stock status:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadStockStatus();
  }, []);

  const isInStock = (productId: string): boolean => {
    // Default to true (in stock) if not specified
    return stockStatus[productId] !== false;
  };

  return (
    <StockContext.Provider value={{ stockStatus, isLoaded, isInStock, refreshStock: loadStockStatus }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}
