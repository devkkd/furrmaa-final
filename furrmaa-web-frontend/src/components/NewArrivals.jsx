'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { fetchProducts, normalizeProduct } from '@/lib/api'

export default function NewArrivals() {
  const petType = usePetStore((state) => state.petType)
  const [arrivals, setArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  checkMobile()

  window.addEventListener("resize", checkMobile)

  return () => window.removeEventListener("resize", checkMobile)
}, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        let list = await fetchProducts({
          petType: petType || undefined,
          sortBy: 'newest',
          limit: 12,
        })
        if ((!list || list.length === 0) && petType) {
          list = await fetchProducts({ sortBy: 'newest', limit: 12 })
        }
        if (!cancelled) {
          setArrivals((list || []).map(normalizeProduct).filter(Boolean))
        }
      } catch {
        if (!cancelled) setArrivals([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [petType])
const displayProducts = isMobile
  ? arrivals.slice(0, 6)
  : arrivals
  return (
    <section className="w-full py-6 md:py-10">
     <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-5 md:mb-6">
  <h2 className="text-[22px] md:text-3xl font-bold text-left md:text-center text-gray-900">
    New Arrivals
  </h2>

  <Link
    href={`/shop?petType=${petType || 'dog'}`}
    className="text-[17px] md:bg-[#1F2E46] md:text-white font-medium md:font-semibold md:px-6 md:py-3 md:rounded-full hover:text-[#1F2E46] md:hover:bg-[#2C3E50] transition-colors"
  >
    See All →
  </Link>
</div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-5 md:gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading...</p>
        ) : arrivals.length === 0 ? (
          <p className="text-gray-500 col-span-full">No new products yet. Add products from Admin → Products.</p>
        ) : (
          displayProducts.map((product, i) => (
            <ProductCard key={product.id || product._id || i} product={product} />
          ))
        )}
      </div>
    </section>
  )
}
