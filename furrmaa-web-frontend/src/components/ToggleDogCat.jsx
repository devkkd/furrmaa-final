// components/ToggleDogCat.jsx
'use client'

import Image from 'next/image'
import { usePetStore } from '@/store/petStore'

export default function ToggleDogCat({ onShopPage, currentPetType, onPetTypeChange }) {
  const petType = usePetStore(state => state.petType)
  const setPet = usePetStore(state => state.setPet)

  // On shop: use URL state; elsewhere use store. null = neither selected (no auto Dog)
  const active = onShopPage ? (currentPetType || null) : (petType || null)
  const handleClick = (type) => {
    setPet(type)
    if (onShopPage && onPetTypeChange) onPetTypeChange(type)
  }

  return (
    <div className="mx-auto mt-8 md:w-[400px] w-[350px] md:h-[60px] h-[50px] bg-white border border-gray-300 rounded-full p-2 flex items-center">

      <button
        onClick={() => handleClick('dog')}
        className={`flex-1 h-full rounded-full flex items-center justify-center gap-2 text-sm font-medium transition
          ${active === 'dog' ? 'bg-[#1F2E46] text-white' : 'text-gray-400'}
        `}
      >
        <Image 
          src="/images/icons/dogicon.png" 
          alt="Dog" 
          width={20} 
          height={20} 
          className="object-contain"
        />
        Dog Essentials
      </button>

      <button
        onClick={() => handleClick('cat')}
        className={`flex-1 h-full rounded-full flex items-center justify-center gap-2 text-sm font-medium transition
          ${active === 'cat' ? 'bg-[#95E562] text-gray-900' : 'text-gray-400'}
        `}
      >
        <Image 
          src="/images/icons/caticon.png" 
          alt="Cat" 
          width={20} 
          height={20} 
          className="object-contain"
        />
        Cat Essentials
      </button>

    </div>
  )
}