'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function SimilarProducts({ category, currentProductId }) {
  // Fetch products that match the same category
  const { products, loading } = useProducts({ category });

  // Filter out the currently viewed product so it doesn't suggest itself
  // and slice the array to show only up to 4 products in the row
  const similarProducts = products
    .filter((p) => String(p.id) !== String(currentProductId) && String(p._id) !== String(currentProductId))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
        <div className="animate-pulse flex gap-4">Loading...</div>
      </div>
    );
  }

  // If there are no other products in this category, hide the section entirely
  if (similarProducts.length === 0) {
    return null; 
  }

  return (
    <div className="mt-20 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
      
      {/* Grid layout exactly like your shop page reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {similarProducts.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
}