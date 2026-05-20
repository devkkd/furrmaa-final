import {
  getToken,
  fetchServerCart,
  addToServerCart,
  updateServerCartItem,
  removeFromServerCart,
  clearServerCart,
} from '@/lib/api';
import { serverCartToStoreItems } from '@/lib/cartHelpers';
import { useCartStore } from '@/store/cartStore';

export async function syncCartFromServer() {
  if (!getToken()) return;
  try {
    const cart = await fetchServerCart();
    useCartStore.getState().setItems(serverCartToStoreItems(cart));
  } catch {
    /* keep local cart */
  }
}

/** Push guest cart lines to server after login */
export async function mergeGuestCartToServer() {
  if (!getToken()) return;
  const local = useCartStore.getState().items;
  if (!local.length) {
    await syncCartFromServer();
    return;
  }
  try {
    for (const line of local) {
      await addToServerCart(line.productId, line.qty || 1);
    }
    await syncCartFromServer();
  } catch {
    await syncCartFromServer();
  }
}

export async function addProductToCart(product, qty = 1) {
  const productId = String(product?.id || product?._id || '').trim();
  if (!productId) return;
  useCartStore.getState().addItem(product);
  if (!getToken()) return;
  try {
    const cart = await addToServerCart(productId, qty);
    useCartStore.getState().setItems(serverCartToStoreItems(cart));
  } catch {
    /* local already updated */
  }
}

export async function updateCartQuantity(productId, qty) {
  const id = String(productId);
  useCartStore.getState().updateQty(id, qty);
  if (!getToken()) return;
  try {
    const cart = await updateServerCartItem(id, qty);
    useCartStore.getState().setItems(serverCartToStoreItems(cart));
  } catch {
    /* local already updated */
  }
}

export async function removeProductFromCart(productId) {
  const id = String(productId);
  useCartStore.getState().removeItem(id);
  if (!getToken()) return;
  try {
    const cart = await removeFromServerCart(id);
    useCartStore.getState().setItems(serverCartToStoreItems(cart));
  } catch {
    /* local already updated */
  }
}

export async function clearCartEverywhere() {
  useCartStore.getState().clearCart();
  if (!getToken()) return;
  try {
    await clearServerCart();
  } catch {
    /* ignore */
  }
}
