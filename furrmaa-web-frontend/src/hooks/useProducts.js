'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchProducts, normalizeProduct } from '@/lib/api';

export function useProducts(options = {}) {
  const { petType, category, age, size, dietary, search, sortBy, minRating, limit } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasData = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Keep previous products visible while refetching (no blank flash)
    if (!hasData.current) setLoading(true);
    fetchProducts({ petType, category, age, size, dietary, search, sortBy, minRating, limit })
      .then((apiProducts) => {
        if (cancelled) return;
        const list = apiProducts || [];
        const normalized = list.map(normalizeProduct);
        setProducts(normalized);
        hasData.current = true;
      })
      .catch(() => {
        if (cancelled) return;
        if (!hasData.current) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [petType, category, age, size, dietary, search, sortBy, minRating, limit]);

  return { products, loading };
}
