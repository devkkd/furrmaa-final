'use client'

import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { useProducts } from '@/hooks/useProducts'

export default function BestDeal() {
  const petType = usePetStore(state => state.petType)
  const { products: bestDeals, loading } = useProducts({ petType: petType || undefined, limit: 12 })

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-6">
        <h2 className="text-[28px] md:text-3xl font-bold text-center mb-10 text-gray-900">Best Deals</h2>

        <button className="bg-[#1F2E46] text-white text-sm font-semibold px-6 py-3 rounded-full">
          See All →
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? <p className="text-gray-500 col-span-full">Loading...</p> : bestDeals.map((product, i) => (
          <ProductCard key={product.id || product._id || i} product={product} />
        ))}
      </div>
    </section>
  )
}
