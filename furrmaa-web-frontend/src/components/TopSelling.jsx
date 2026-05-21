'use client'

import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { useProducts } from '@/hooks/useProducts'
import Link from 'next/link'

export default function TopSelling() {
  const petType = usePetStore(state => state.petType)
  const { products: topSelling, loading } = useProducts({ petType: petType || undefined, limit: 12, sortBy: 'popularity' })

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-6">
        <h2 className="text-[28px] md:text-3xl font-bold text-center mb-10 text-gray-900">Top-Selling Products</h2>

        <Link   
          href="/shop"
          className="bg-[#1F2E46] text-white text-sm font-semibold px-6 py-3 rounded-full inline-block text-center hover:bg-[#2C3E50] transition-colors"
        >
          See All →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? <p className="text-gray-500 col-span-full">Loading...</p> : topSelling.map((product, i) => (
          <ProductCard key={product.id || product._id || i} product={product} />
        ))}
      </div>
    </section>
  )
}
