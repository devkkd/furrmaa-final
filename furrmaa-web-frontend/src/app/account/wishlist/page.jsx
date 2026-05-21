'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/Container';
import { fetchWishlist, removeFromWishlist } from '@/lib/api';
import { useWishlistStore } from '@/store/wishlistStore';
import { addProductToCart } from '@/lib/cartActions';
import { useRouter } from 'next/navigation';

const PLACEHOLDER = 'https://placehold.co/120x120/e5e7eb/6b7280?text=Pet';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const removeId = useWishlistStore((s) => s.removeId);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchWishlist();
      setItems(list);
      useWishlistStore.getState().setIds(
        list.map((w) => w.product?._id).filter(Boolean)
      );
    } catch (e) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      removeId(productId);
      setItems((prev) => prev.filter((w) => String(w.product?._id) !== String(productId)));
    } catch (e) {
      setError(e.message || 'Could not remove item');
    }
  };

  const handleAddToCart = async (product) => {
    await addProductToCart(product);
    router.push('/cart');
  };

  return (
    <section className="bg-white h-full w-full pb-24 md:pb-10">
      <Container>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-[900px] shadow-sm">
          <h1 className="text-[28px] font-bold text-black mb-2">Wishlist</h1>
          <p className="text-gray-500 text-sm mb-6">Products you saved for later</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your wishlist is empty</p>
              <Link
                href="/shop"
                className="inline-block bg-[#1F2E46] text-white font-semibold px-6 py-3 rounded-lg"
              >
                Browse shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((row) => {
                const p = row.product;
                if (!p?._id) return null;
                const price = p.discountPrice ?? p.price ?? 0;
                const img = p.images?.[0] || PLACEHOLDER;
                return (
                  <li
                    key={row._id || p._id}
                    className="flex gap-4 p-4 border border-gray-100 rounded-2xl"
                  >
                    <Link href={`/shop/product_details/${p._id}`}>
                      <img
                        src={img}
                        alt={p.name}
                        className="w-24 h-24 object-cover rounded-xl bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/product_details/${p._id}`}
                        className="font-semibold text-gray-900 hover:underline line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <p className="text-lg font-bold mt-1">₹{Number(price).toLocaleString('en-IN')}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="bg-[#1F2E46] text-white text-sm font-semibold px-4 py-2 rounded-lg"
                        >
                          Add to cart
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(p._id)}
                          className="text-red-600 text-sm font-medium px-3 py-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
