"use client";

import { useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ToggleDogCat from "@/components/ToggleDogCat";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { usePetStore } from "@/store/petStore";
import { useProducts } from "@/hooks/useProducts";

function StorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const petType = usePetStore((state) => state.petType);
  const setPetType = usePetStore((state) => state.setPet);
  const filters = usePetStore((state) => state.filters);
  const setFilter = usePetStore((state) => state.setFilter);

  // Only URL = source of truth on shop
  const categoryFromUrl = searchParams.get("category") || null;
  const petFromUrl = searchParams.get("petType") || null;
  const ratingFromUrl = searchParams.get("rating") || searchParams.get("minRating") || null;
  const ageFromUrl = searchParams.get("age") || null;
  const sizeFromUrl = searchParams.get("size") || null;
  const dietaryFromUrl = searchParams.get("dietary") || null;

  // Pet type sirf jab URL/filter me select ho – select na ho to backend par filter nahi (sab dikhenge)
  const effectivePetType = petFromUrl && String(petFromUrl).trim() ? String(petFromUrl).trim().toLowerCase() : undefined;

  // Sync to store so Header/other links carry current pet type
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setFilter("category", cat);
    if (ratingFromUrl) setFilter("rating", ratingFromUrl);
    if (ageFromUrl) setFilter("age", ageFromUrl);
    if (sizeFromUrl) setFilter("size", sizeFromUrl);
    if (dietaryFromUrl) setFilter("dietary", dietaryFromUrl);
    setPetType(effectivePetType ?? "dog");
  }, [searchParams, effectivePetType, ratingFromUrl, ageFromUrl, sizeFromUrl, dietaryFromUrl, setFilter, setPetType]);

  // Shop par sirf URL = source of truth (persisted store se mat lo – warna purani dietary/size etc. chali jati hai)
  const sidebarFilters = {
    petType: effectivePetType ?? "dog",
    category: categoryFromUrl || null,
    age: ageFromUrl || null,
    dogBreed: filters?.dogBreed || null,
    catBreed: filters?.catBreed || null,
    size: sizeFromUrl || null,
    dietary: dietaryFromUrl || null,
    rating: ratingFromUrl || null,
  };

  // When user changes filter in sidebar: update store + URL (all filters persist)
  const handleFilterChange = useCallback(
    (payload) => {
      // Handle petType - take first value if comma-separated
      if (payload.hasOwnProperty("petType")) {
        const petTypeValue = payload.petType ? String(payload.petType).split(",")[0].toLowerCase() : "dog";
        setPetType(petTypeValue === "cat" ? "cat" : "dog");
      }
      if (payload.hasOwnProperty("category")) {
        const categoryValue = payload.category && String(payload.category).trim() ? String(payload.category).toLowerCase().trim() : null;
        setFilter("category", categoryValue);
      }
      if (payload.hasOwnProperty("rating")) {
        const ratingValue = payload.rating && String(payload.rating).trim() ? payload.rating.trim() : null;
        setFilter("rating", ratingValue);
      }
      if (payload.hasOwnProperty("age")) {
        const ageValue = payload.age && String(payload.age).trim() ? String(payload.age).toLowerCase().trim() : null;
        setFilter("age", ageValue);
      }
      if (payload.hasOwnProperty("size")) setFilter("size", payload.size && String(payload.size).trim() ? payload.size : null);
      if (payload.hasOwnProperty("dietary")) setFilter("dietary", payload.dietary && String(payload.dietary).trim() ? payload.dietary : null);
      if (payload.hasOwnProperty("dogBreed")) setFilter("dogBreed", payload.dogBreed && String(payload.dogBreed).trim() ? payload.dogBreed : null);
      if (payload.hasOwnProperty("catBreed")) setFilter("catBreed", payload.catBreed && String(payload.catBreed).trim() ? payload.catBreed : null);

      const params = new URLSearchParams();
      // Sirf selected filters URL me – koi section select na ho to param mat bhejo
      const pet = payload.hasOwnProperty("petType") ? (payload.petType && String(payload.petType).trim() ? String(payload.petType).toLowerCase().trim() : null) : effectivePetType;
      const cat = payload.hasOwnProperty("category") ? (payload.category && String(payload.category).trim() ? String(payload.category).toLowerCase().trim() : null) : categoryFromUrl;
      const rating = payload.hasOwnProperty("rating") ? (payload.rating && String(payload.rating).trim() ? payload.rating.trim() : null) : ratingFromUrl;
      const age = payload.hasOwnProperty("age") ? (payload.age && String(payload.age).trim() ? String(payload.age).toLowerCase().trim() : null) : ageFromUrl;
      const size = payload.hasOwnProperty("size") ? (payload.size && String(payload.size).trim() ? String(payload.size).trim() : null) : sizeFromUrl;
      const dietaryVal = payload.hasOwnProperty("dietary") ? (payload.dietary && String(payload.dietary).trim() ? String(payload.dietary).trim() : null) : dietaryFromUrl;

      if (pet) params.set("petType", pet);
      if (cat) params.set("category", cat);
      if (rating) params.set("rating", rating);
      if (age) params.set("age", age);
      if (size) params.set("size", size);
      if (dietaryVal) params.set("dietary", dietaryVal);

      setMobileFilterOpen(false);
      router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [setPetType, setFilter, effectivePetType, categoryFromUrl, ratingFromUrl, ageFromUrl, sizeFromUrl, dietaryFromUrl, router]
  );

  // API ko sirf URL wale filters bhejo – store/persist mat use karo (purani dietary/size nahi jayegi)
  const effectiveRating = ratingFromUrl?.trim?.() || undefined;
  const effectiveCategory = categoryFromUrl?.trim?.() || undefined;
  const effectiveAge = ageFromUrl?.trim?.() || undefined;
  const effectiveSize = sizeFromUrl?.trim?.() || undefined;
  const effectiveDietary = dietaryFromUrl?.trim?.() || undefined;
  const ratingNums = effectiveRating ? String(effectiveRating).split(",").map((r) => parseInt(r.trim(), 10)).filter((n) => !isNaN(n)) : [];
  const minRatingNum = ratingNums.length > 0 ? Math.min(...ratingNums) : undefined;

  const { products: apiProducts, loading } = useProducts({
    petType: effectivePetType,
    category: effectiveCategory || undefined,
    age: effectiveAge || undefined,
    size: effectiveSize || undefined,
    dietary: effectiveDietary || undefined,
    minRating: minRatingNum ?? undefined,
  });

  // Normalize category for comparison (case-insensitive, handle slugs)
  const normalizeCategory = (cat) => {
    if (!cat) return null;
    return cat.toLowerCase().trim();
  };

  const filteredProducts = apiProducts.filter((p) => {
    if (effectiveCategory) {
      const productCategory = normalizeCategory(p.category);
      const filterCats = effectiveCategory.split(",").map((c) => normalizeCategory(c.trim())).filter(Boolean);
      if (filterCats.length && !filterCats.includes(productCategory)) return false;
    }
    if (minRatingNum != null && (p.rating || 0) < minRatingNum) return false;
    return true;
  });

  return (
    <div className="bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <h1 className="text-4xl font-bold text-gray-900">Shop</h1>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-[#D9DCE2] rounded-xl text-gray-700 font-medium"
          >
            <span>Filters</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          </button>
        </div>
        <ToggleDogCat
          onShopPage
          currentPetType={effectivePetType ?? "dog"}
          onPetTypeChange={(type) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("petType", type);
            if (categoryFromUrl) params.set("category", categoryFromUrl);
            router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
          }}
        />
        <div className="flex gap-8 mt-6">
          <div className="hidden md:block w-64 shrink-0">
            <FilterSidebar filters={sidebarFilters} onChange={handleFilterChange} />
          </div>
          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} aria-hidden />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-[#D9DCE2] px-4 py-3 flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Filters</h2>
                  <button type="button" onClick={() => setMobileFilterOpen(false)} className="p-2 text-gray-500 hover:text-black">✕</button>
                </div>
                <div className="p-4">
                  <FilterSidebar filters={sidebarFilters} onChange={handleFilterChange} />
                </div>
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {loading ? (
                <p className="text-gray-500 col-span-full">Loading...</p>
              ) : (
                <>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-gray-900 col-span-full">No products found</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading...</div>}>
      <StorePageContent />
    </Suspense>
  );
}


// "use client"
// import ToggleDogCat from '@/components/ToggleDogCat'
// import { usePetStore } from '@/store/petStore'
// import { products } from '@/data/products'

// export default function StorePage() {
//   const petType = usePetStore(state => state.petType)

//   const visibleProducts = products.filter(
//     p => p.petType === petType
//   )

//   return (
//     <>
//       <ToggleDogCat />

//       {visibleProducts.map(p => (
//         <div key={p.id}>{p.name}</div>
//       ))}
//     </>
//   )
// }

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import FilterSidebar from "@/components/FilterSidebar";

// const PRODUCTS = Array(8).fill({
//     id: 1,
//     name: "Canine Creek Club Ultra Premium Dry",
//     image: "/dog-food.png",
//     rating: 5,
//     reviews: 265,
//     price: 2229,
//     originalPrice: 2449,
// });

// export default function StorePage() {
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     // SINGLE SOURCE FILTER STATE
//     const [filters, setFilters] = useState({
//         petType: null,
//         category: null,
//         age: null,
//         dogBreed: null,
//         catBreed: null,
//         size: null,
//         dietary: null,
//         rating: null,
//         sort: null,
//     });

//     // useEffect(() => {
//     //     console.log(filters)
//     // }, [filters])


//     // Read from URL
//     useEffect(() => {
//         setFilters({
//             petType: searchParams.get("petType"),
//             category: searchParams.get("category"),
//             age: searchParams.get("age"),
//             dogBreed: searchParams.get("dogBreed"),
//             catBreed: searchParams.get("catBreed"),
//             size: searchParams.get("size"),
//             dietary: searchParams.get("dietary"),
//             rating: searchParams.get("rating"),
//             sort: searchParams.get("sort"),
//         });
//     }, [searchParams]);


//     // Update URL when filters change
//     const updateFilters = (updated) => {
//         const params = new URLSearchParams(searchParams.toString());

//         Object.entries(updated).forEach(([key, value]) => {
//             if (!value) params.delete(key);
//             else params.set(key, value);
//         });

//         router.push(`/shop?${params.toString()}`);
//     };

//     return (
//         <div className="bg-white w-full">
//             <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-8">
//                     <h1 className="text-4xl font-bold text-gray-900">Shop</h1>

//                     <select
//                         className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
//                         value={filters.sort || ""}
//                         onChange={(e) =>
//                             onChange({ sort: e.target.value })}>
//                         <option value="">Sort By</option>
//                         <option value="price_low">Price: Low to High</option>
//                         <option value="price_high">Price: High to Low</option>
//                     </select>
//                 </div>

//                 <div className="flex gap-8">
//                     {/* Sidebar */}
//                     <div className="hidden md:block w-64 shrink-0">
//                         <FilterSidebar
//                             filters={filters}
//                             onChange={updateFilters}
//                         />
//                     </div>

//                     {/* Products */}
//                     <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
//                         {/* {PRODUCTS.map((product, i) => (
//               <ProductCard key={i} product={product} />
//             ))} */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
