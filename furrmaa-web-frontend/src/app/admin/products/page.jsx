'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminGetProducts, adminDeleteProduct } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <Link href="/admin/products/new" className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          Add Product
        </Link>
      </div>

      {/* Card grid – same as app: image, name, category, price/discount, stock, inactive badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No products.</p>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative aspect-square bg-gray-100">
                {p.images?.length > 0 ? (
                  <AdminImage
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">📦</div>
                )}
                {!p.isActive && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-500 text-white">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{p.category || '–'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {p.discountPrice != null && p.discountPrice < (p.price ?? 0) ? (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{(p.price ?? 0).toLocaleString('en-IN')}</span>
                      <span className="font-semibold text-gray-900">₹{(p.discountPrice ?? 0).toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{(p.price ?? 0).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Stock: {p.stock ?? 0}</p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="flex-1 text-center text-sm font-medium text-[#1F2E46] bg-gray-100 hover:bg-gray-200 py-2 rounded-lg"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id, p.name)}
                    className="flex-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
