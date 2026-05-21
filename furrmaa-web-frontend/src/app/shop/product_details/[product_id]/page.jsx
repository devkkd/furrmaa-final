'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProductById, normalizeProduct } from '@/lib/api';
import { addProductToCart } from '@/lib/cartActions';

// IMPORT THE NEW COMPONENT
import SimilarProducts from '@/components/SimilarProducts';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.product_id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async () => {
    await addProductToCart(product);
    router.push('/cart');
  };

  useEffect(() => {
    if (!productId) return;
    fetchProductById(productId)
      .then((p) => setProduct(normalizeProduct(p)))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-700">Product not found.</p>
          <Link href="/shop" className="text-[#1F2E46] font-medium mt-2 inline-block">← Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white min-h-screen py-8 px-4">
        {/* 1. Main Product Details (kept your max-w-4xl) */}
        <div className="max-w-4xl mx-auto">
          <Link href="/shop" className="text-[#1F2E46] font-medium mb-4 inline-block">← Back to Shop</Link>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-4">
              <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full md:w-1/2">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.brand && <p className="text-sm text-gray-500 mb-2">{product.brand}</p>}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base font-semibold text-gray-900">₹{product.price}</span>
                {product.oldPrice != null && (
                  <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
                )}
              </div>
              {product.description && (
                <div
                  className="text-gray-600 text-sm leading-relaxed mb-6 product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              <button
                className="w-full border border-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-black hover:text-white transition"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>

        {/* 2. Similar Products Section */}
        <div className="max-w-6xl mx-auto">
          {/* Only render if the product actually has a category */}
          {product.category && (
            <SimilarProducts
              category={product.category}
              currentProductId={product.id || product._id}
            />
          )}
        </div>

      </div>
      <WhyChooseFurrmaa/>
    </>

  );
}