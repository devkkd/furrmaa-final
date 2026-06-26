'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, normalizeProduct } from '@/lib/api';

export function useProducts(options = {}) {
  const { petType, category, age, size, dietary, search, sortBy, minRating, limit } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts({ petType, category, age, size, dietary, search, sortBy, minRating, limit })
      .then((apiProducts) => {
        if (cancelled) return;
        const list = apiProducts || [];
        const normalized = list.map(normalizeProduct);
        setProducts(normalized);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [petType, category, age, size, dietary, search, sortBy, minRating, limit]);

  return { products, loading };
}
