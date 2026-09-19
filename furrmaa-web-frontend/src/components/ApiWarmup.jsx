'use client';

import { useEffect } from 'react';
import {
  fetchMainCategories,
  fetchProducts,
  fetchWhyChooseFeatures,
  fetchHopePosts,
  fetchPetEvents,
  fetchVeterinarians,
  getToken,
} from '@/lib/api';
import { usePetStore } from '@/store/petStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * Warm critical public APIs in the background so home/shop feel instant.
 * Safe: uses existing cache + in-flight dedupe.
 */
export default function ApiWarmup() {
  const petType = usePetStore((s) => s.petType) || 'dog';

  useEffect(() => {
    const warm = () => {
      fetchMainCategories({ section: 'everyday', petType }).catch(() => {});
      fetchMainCategories({ section: 'wellness', petType }).catch(() => {});
      fetchProducts({ petType, sortBy: 'popularity', limit: 12 }).catch(() => {});
      fetchProducts({ petType, sortBy: 'newest', limit: 12 }).catch(() => {});
      fetchProducts({ petType, bestDeals: true, limit: 12 }).catch(() => {});
      fetchWhyChooseFeatures().catch(() => {});
      fetchHopePosts({ limit: 12 }).catch(() => {});
      fetchPetEvents({ city: 'Jaipur' }).catch(() => {});
      fetchVeterinarians({}).catch(() => {});
      if (getToken()) useWishlistStore.getState().ensureLoaded();
    };

    // Idle warmup — don't block first paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(warm, 400);
    return () => clearTimeout(t);
  }, [petType]);

  return null;
}
