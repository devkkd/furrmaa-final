'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  fetchMainCategories,
  fetchProducts,
  fetchWhyChooseFeatures,
  getToken,
} from '@/lib/api';
import { usePetStore } from '@/store/petStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * Light prefetch for home catalog only — no health gate flood (VPS is always on).
 * Other pages fetch what they need; withCache still dedupes.
 */
export default function ApiWarmup() {
  const pathname = usePathname();
  const petType = usePetStore((s) => s.petType) || 'dog';
  const isHome = pathname === '/' || pathname === '';

  useEffect(() => {
    if (!isHome) {
      if (getToken()) useWishlistStore.getState().ensureLoaded();
      return;
    }

    let cancelled = false;

    const warm = () => {
      if (cancelled) return;
      Promise.allSettled([
        fetchMainCategories({ section: 'everyday', petType }),
        fetchMainCategories({ section: 'wellness', petType }),
        fetchProducts({ petType, sortBy: 'popularity', limit: 12 }),
        fetchProducts({ petType, sortBy: 'newest', limit: 12 }),
        fetchProducts({ petType, bestDeals: true, limit: 12 }),
        fetchWhyChooseFeatures(),
      ]).finally(() => {
        if (!cancelled && getToken()) useWishlistStore.getState().ensureLoaded();
      });
    };

    // Slight defer so first paint / LCP can start first
    const t = setTimeout(warm, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isHome, petType]);

  return null;
}
