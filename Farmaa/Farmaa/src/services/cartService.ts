import api from '../config/api';

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  quantity: number;
  image?: string;
  images?: string[];
  discount?: number;
};

export function mapCartToLines(cart: any): CartLine[] {
  if (!cart?.items?.length) return [];
  return cart.items
    .map((item: any) => {
      const p = item.product;
      if (!p?._id) return null;
      const discountPrice = p.discountPrice ?? p.price ?? 0;
      const price = p.price ?? discountPrice;
      return {
        productId: p._id,
        name: p.name,
        price,
        discountPrice,
        quantity: item.quantity || 1,
        image: p.images?.[0],
        images: p.images,
        discount:
          price > discountPrice
            ? Math.round(((price - discountPrice) / price) * 100)
            : 0,
      };
    })
    .filter(Boolean) as CartLine[];
}

export function linesToCheckoutItems(lines: CartLine[]) {
  return lines.map((line) => ({
    _id: line.productId,
    id: line.productId,
    name: line.name,
    quantity: line.quantity,
    price: line.discountPrice,
    discountPrice: line.discountPrice,
    originalPrice: line.price,
  }));
}

export async function fetchServerCart() {
  const res = await api.CLIENT.get(api.ENDPOINTS.CART);
  return mapCartToLines(res.data?.cart);
}

export async function addProductToCart(productId: string, quantity = 1) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.CART}/items`, {
    productId,
    quantity,
  });
  return mapCartToLines(res.data?.cart);
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
  const res = await api.CLIENT.put(`${api.ENDPOINTS.CART}/items/${productId}`, {
    quantity,
  });
  return mapCartToLines(res.data?.cart);
}

export async function removeFromCart(productId: string) {
  const res = await api.CLIENT.delete(`${api.ENDPOINTS.CART}/items/${productId}`);
  return mapCartToLines(res.data?.cart);
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.COUPONS}/validate`, {
    code,
    subtotal,
  });
  return res.data?.coupon;
}
