'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchProducts, normalizeProduct, getBaseUrl } from '@/lib/api';
import { getCached } from '@/lib/apiCache';

function productsCacheKey(params = {}) {
  const base = getBaseUrl();
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.petType) q.set('petType', params.petType);
  if (params.age) q.set('age', params.age);
  if (params.size) q.set('size', params.size);
  if (params.dietary) q.set('dietary', params.dietary);
  if (params.search) q.set('search', params.search);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.minRating != null) q.set('minRating', params.minRating);
  if (params.minPrice != null) q.set('minPrice', params.minPrice);
  if (params.maxPrice != null) q.set('maxPrice', params.maxPrice);
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.bestDeals) q.set('bestDeals', 'true');
  return `products:${base}/products${q.toString() ? `?${q}` : ''}`;
}

export function useProducts(options = {}) {
  const { petType, category, age, size, dietary, search, sortBy, minRating, limit, bestDeals } =
    options;

  const key = productsCacheKey({
    petType,
    category,
    age,
    size,
    dietary,
    search,
    sortBy,
    minRating,
    limit,
    bestDeals,
  });

  const cached = typeof window !== 'undefined' ? getCached(key) : null;
  const initial = Array.isArray(cached) && cached.length ? cached.map(normalizeProduct) : [];

  const [products, setProducts] = useState(initial);
  const [loading, setLoading] = useState(initial.length === 0);
  const hasData = useRef(initial.length > 0);

  useEffect(() => {
    let cancelled = false;
    if (!hasData.current) setLoading(true);

    fetchProducts({
      petType,
      category,
      age,
      size,
      dietary,
      search,
      sortBy,
      minRating,
      limit,
      bestDeals,
    })
      .then((apiProducts) => {
        if (cancelled) return;
        const normalized = (apiProducts || []).map(normalizeProduct);
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

    return () => {
      cancelled = true;
    };
  }, [petType, category, age, size, dietary, search, sortBy, minRating, limit, bestDeals]);

  return { products, loading };
}
