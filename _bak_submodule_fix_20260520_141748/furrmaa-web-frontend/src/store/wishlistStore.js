import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,
  setIds: (idList) =>
    set({ ids: new Set((idList || []).map(String)), loaded: true }),
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
}));
