// src/store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const resolvedProductId = String(product?.id || product?._id || '').trim()
        if (!resolvedProductId) return
        const items = get().items
        const found = items.find(i => String(i.productId) === resolvedProductId)

        if (found) {
          set({
            items: items.map(i =>
              String(i.productId) === resolvedProductId
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
          })
        } else {
          const price = product.discountPrice ?? product.price;
          const oldPrice = product.discountPrice != null ? product.price : (product.oldPrice ?? product.price);
          set({
            items: [...items, {
              productId: resolvedProductId,
              qty: 1,
              product: {
                id: resolvedProductId,
                name: product.name,
                image: product.image || product.images?.[0],
                price,
                oldPrice: oldPrice > price ? oldPrice : undefined
              }
            }],
          })
        }
      },
      removeItem: (productId) => {
        const targetId = String(productId)
        set({ items: get().items.filter(i => String(i.productId) !== targetId) })
      },
      updateQty: (productId, qty) => {
        if (qty < 1) return
        const targetId = String(productId)
        set({
          items: get().items.map(i =>
            String(i.productId) === targetId ? { ...i, qty } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items: items || [] }),
    }),
    { name: 'guest-cart' }
  )
)
