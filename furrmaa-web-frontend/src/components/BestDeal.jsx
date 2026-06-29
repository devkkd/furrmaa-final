'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { fetchProducts, normalizeProduct } from '@/lib/api'

export default function BestDeal() {
  const petType = usePetStore((state) => state.petType)
  const [bestDeals, setBestDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        let list = await fetchProducts({
          petType: petType || undefined,
          bestDeals: true,
          limit: 12,
        })
        if ((!list || list.length === 0) && petType) {
          list = await fetchProducts({ bestDeals: true, limit: 12 })
        }
        if (!cancelled) {
          setBestDeals((list || []).map(normalizeProduct).filter(Boolean))
        }
      } catch {
        if (!cancelled) setBestDeals([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [petType])

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-6">
        <h2 className="text-[28px] md:text-3xl font-bold text-gray-900">Best Deals</h2>

        <Link
          href={`/shop?petType=${petType || 'dog'}`}
          className="bg-[#1F2E46] text-white text-sm font-semibold px-6 py-3 rounded-full"
        >
          See All →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading...</p>
        ) : bestDeals.length === 0 ? (
          <p className="text-gray-500 col-span-full">
            No best deals yet. Enable &quot;Show on homepage Best Deals&quot; when adding a product in Admin.
          </p>
        ) : (
          bestDeals.map((product, i) => (
            <ProductCard key={product.id || product._id || i} product={product} />
          ))
        )}
      </div>
    </section>
  )
}
