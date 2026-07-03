'use client'

import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { useProducts } from '@/hooks/useProducts'
import { useEffect, useState } from "react";
import Link from 'next/link'

export default function TopSelling() {
  const petType = usePetStore(state => state.petType)
  const { products: topSelling, loading } = useProducts({
  petType: petType || undefined,
  limit: 12,
  sortBy: "popularity",
});
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

const displayProducts = isMobile
  ? topSelling.slice(0, 6)
  : topSelling;

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-6">
        <h2 className="text-[22px] md:text-3xl font-bold text-left md:text-center text-gray-900">
  Top-Selling Products
</h2>

        <Link   
          href="/shop"
          className="text-[17px] md:bg-[#1F2E46] md:text-white font-medium md:font-semibold md:px-6 md:py-3 md:rounded-full hover:text-[#1F2E46] md:hover:bg-[#2C3E50] transition-colors"
        >
          See All →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-5 md:gap-4">
        {loading ? <p className="text-gray-500 col-span-full">Loading...</p> : displayProducts.map((product, i) => (
          <ProductCard key={product.id || product._id || i} product={product} />
        ))}
      </div>
    </section>
  )
}
