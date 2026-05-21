/** Map backend cart document to Zustand cart store items */
export function serverCartToStoreItems(cart) {
  if (!cart?.items?.length) return [];
  return cart.items
    .map((item) => {
      const p = item.product;
      if (!p?._id) return null;
      const discountPrice = p.discountPrice ?? p.price ?? 0;
      const price = p.price ?? discountPrice;
      const selling = discountPrice > 0 && discountPrice < price ? discountPrice : price;
      const oldPrice = selling < price ? price : undefined;
      return {
        productId: String(p._id),
        qty: item.quantity || 1,
        product: {
          id: String(p._id),
          name: p.name,
          image: p.images?.[0],
          price: selling,
          oldPrice,
        },
      };
    })
    .filter(Boolean);
}
