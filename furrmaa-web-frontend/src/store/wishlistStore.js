import { create } from 'zustand';
import { getToken, fetchWishlist } from '@/lib/api';

let bootstrapPromise = null;

export const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,
  loading: false,
  setIds: (idList) =>
    set({ ids: new Set((idList || []).map(String)), loaded: true, loading: false }),
  addId: (id) => {
    const next = new Set(get().ids);
    next.add(String(id));
    set({ ids: next });
  },
  removeId: (id) => {
    const next = new Set(get().ids);
    next.delete(String(id));
    set({ ids: next });
  },
  has: (id) => get().ids.has(String(id)),
  /**
   * Load wishlist once per session (shared across all ProductCards).
   * Safe to call many times — only one network request runs.
   */
  ensureLoaded: async () => {
    if (!getToken()) {
      set({ loaded: true, loading: false, ids: new Set() });
      return;
    }
    if (get().loaded) return;
    if (bootstrapPromise) return bootstrapPromise;

    set({ loading: true });
    bootstrapPromise = fetchWishlist()
      .then((list) => {
        const ids = (list || []).map((w) => w.product?._id || w.product).filter(Boolean);
        get().setIds(ids);
      })
      .catch(() => {
        set({ loaded: true, loading: false });
      })
      .finally(() => {
        bootstrapPromise = null;
      });

    return bootstrapPromise;
  },
}));
