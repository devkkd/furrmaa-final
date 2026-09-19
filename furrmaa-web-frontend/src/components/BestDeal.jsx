'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { usePetStore } from '@/store/petStore'
import { fetchProducts, normalizeProduct } from '@/lib/api'
import LogoLoader from '@/components/LogoLoader'

export default function BestDeal() {
  const petType = usePetStore((state) => state.petType)
  const [bestDeals, setBestDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        const list = await fetchProducts({
          petType: petType || undefined,
          bestDeals: true,
          limit: 12,
        })
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

const displayProducts = isMobile
  ? bestDeals.slice(0, 6)
  : bestDeals;

return (
    <section className="w-full py-10">
     <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-6">
  <h2 className="text-[22px] md:text-3xl font-bold text-left md:text-center text-gray-900">
    Best Deals
  </h2>

  <Link
    href={`/shop?petType=${petType || 'dog'}`}
    className="text-[17px] md:bg-[#1F2E46] md:text-white font-medium md:font-semibold md:px-6 md:py-3 md:rounded-full hover:text-[#1F2E46] md:hover:bg-[#2C3E50] transition-colors"
  >
    See All →
  </Link>
</div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {loading ? (
          <LogoLoader />
        ) : bestDeals.length === 0 ? (
          <p className="text-gray-500 col-span-full">
            No best deals yet. Enable &quot;Show on homepage Best Deals&quot; when adding a product in Admin.
          </p>
        ) : (
         displayProducts.map((product, i) => (
            <ProductCard key={product.id || product._id || i} product={product} />
          ))
        )}
      </div>
    </section>
  )
}
