'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaStar, FaRegHeart, FaHeart } from 'react-icons/fa'
import { addProductToCart } from '@/lib/cartActions'
import { getToken, addToWishlist, removeFromWishlist, fetchWishlist } from '@/lib/api'
import { useWishlistStore } from '@/store/wishlistStore'

export default function ProductCard({ product }) {
  const router = useRouter()
  const productId = product._id || product.id
  const wishlistIds = useWishlistStore((s) => s.ids)
  const addWishId = useWishlistStore((s) => s.addId)
  const removeWishId = useWishlistStore((s) => s.removeId)
  const [wishBusy, setWishBusy] = useState(false)

  const inWishlist = wishlistIds.has(String(productId))

  useEffect(() => {
    if (!getToken() || !productId) return
    if (useWishlistStore.getState().loaded) return
    fetchWishlist()
      .then((list) => {
        useWishlistStore.getState().setIds(list.map((w) => w.product?._id).filter(Boolean))
      })
      .catch(() => {})
  }, [productId])

  const productImage = product.images?.[0] || product.image || '/placeholder.png'
  const rating = Math.floor(Number(product.rating) || 0)
  const reviewCount = product.reviews?.length || 0

  const parsePrice = (val) => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return val
    return Number(val.toString().replace(/,/g, '')) || 0
  }

  const p = parsePrice(product.price)
  const op = parsePrice(product.oldPrice)
  const dp = parsePrice(product.discountPrice)

  let currentPrice = p
  let originalPrice = op

  if (dp > 0 && dp < p) {
    currentPrice = dp
    originalPrice = p
  } else if (op > p) {
    currentPrice = p
    originalPrice = op
  }

  const hasDiscount = originalPrice > currentPrice

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(amount))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addProductToCart(product)
    router.push('/cart')
  }

  const toggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!getToken()) {
      router.push('/login')
      return
    }
    setWishBusy(true)
    try {
      if (inWishlist) {
        await removeFromWishlist(productId)
        removeWishId(productId)
      } else {
        await addToWishlist(productId)
        addWishId(productId)
      }
    } catch {
      /* ignore */
    } finally {
      setWishBusy(false)
    }
  }

  return (
    <Link href={`/shop/product_details/${productId}`} className="block group">
      <div className="bg-white text-black rounded-2xl p-2 flex flex-col w-full hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300">

        <div className="relative flex items-center justify-center h-[220px] mb-3 rounded-xl p-4">
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          <button
            type="button"
            disabled={wishBusy}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-colors disabled:opacity-50"
            onClick={toggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {inWishlist ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 text-xl hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        <div className="flex flex-col flex-grow px-1">
          <h3 className="text-[16px] font-normal text-gray-900 leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-[15px] ${i < rating || i < 5 ? 'text-[#FFB800]' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-[14px] font-medium text-gray-800 ml-1">
              {reviewCount > 0 ? reviewCount : '265'}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                ₹{formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] font-medium text-gray-400 line-through">
                  ₹{formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="border-[1.5px] border-[#2C3E50] text-[#2C3E50] rounded-[10px] px-6 py-1.5 text-[13px] font-semibold hover:bg-[#2C3E50] hover:text-white transition-colors duration-300"
            >
              ADD
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
