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

/** Background prefetch — does not block UI (sections show static/cache first). */
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

    const t = setTimeout(warm, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isHome, petType]);

  return null;
}
