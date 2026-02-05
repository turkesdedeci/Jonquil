'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  loading: false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites from localStorage (for guests) or API (for logged in users)
  useEffect(() => {
    if (user) {
      loadFavoritesFromAPI();
    } else {
      loadFavoritesFromLocalStorage();
    }
  }, [user]);

  const loadFavoritesFromLocalStorage = () => {
    const stored = localStorage.getItem('jonquil_favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const saveFavoritesToLocalStorage = (newFavorites: string[]) => {
    localStorage.setItem('jonquil_favorites', JSON.stringify(newFavorites));
  };

  const loadFavoritesFromAPI = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.map((f: any) => f.product_id));
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  };

  const addFavorite = async (productId: string) => {
    const newFavorites = [...favorites, productId];
    setFavorites(newFavorites);

    if (user) {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch (error) {
        console.error('Favori eklenirken hata:', error);
      }
    } else {
      saveFavoritesToLocalStorage(newFavorites);
    }
  };

  const removeFavorite = async (productId: string) => {
    const newFavorites = favorites.filter(id => id !== productId);
    setFavorites(newFavorites);

    if (user) {
      try {
        await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Favori silinirken hata:', error);
      }
    } else {
      saveFavoritesToLocalStorage(newFavorites);
    }
  };

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      loading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
