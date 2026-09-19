"use client"

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Banner from "@/components/Banner";
import ToggleDogCat from "@/components/ToggleDogCat";
import Everyday from "@/components/Everyday";
import Wellness from "@/components/Wellness";
import Card from "@/components/Card";
import TopSelling from "@/components/TopSelling";
import { getToken } from "@/lib/api";
import { useWishlistStore } from "@/store/wishlistStore";

const SectionLoader = () => (
  <div className="w-full py-10 text-center text-sm text-gray-400">Loading...</div>
);

const PetCard = dynamic(() => import("@/components/PetCard"), { loading: SectionLoader });
const NewArrivals = dynamic(() => import("@/components/NewArrivals"), { loading: SectionLoader });
const AboutFurrmaa = dynamic(() => import("@/components/AboutFurrmaa"), { loading: SectionLoader });
const FurrmaaPetAI = dynamic(() => import("@/components/FurrmaaPetAI"), { loading: SectionLoader });
const BestDeal = dynamic(() => import("@/components/BestDeal"), { loading: SectionLoader });
const TrendingPetFeed = dynamic(() => import("@/components/TrendingPetFeed"), { loading: SectionLoader });
const Feedback = dynamic(() => import("@/components/Feedback"), { loading: SectionLoader });
const WhyChooseFurrmaa = dynamic(() => import("@/components/WhyChooseFurrmaa"), { loading: SectionLoader });

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile();

  window.addEventListener("resize", checkMobile);

  return () => window.removeEventListener("resize", checkMobile);
}, []);

  // One wishlist bootstrap for all ProductCards on the page
  useEffect(() => {
    if (getToken()) useWishlistStore.getState().ensureLoaded();
  }, []);

  return (
    <div className="bg-white text-black">
      <Banner />
      <div className="hidden lg:block">
   <ToggleDogCat />
</div>
     <Everyday />

<div className="md:hidden">
  <Card show="first" />
</div>

<Wellness />

<div className="md:hidden">
  <Card show="second" />
</div>

<div className="hidden md:block">
  <Card />
</div>
      <TopSelling />
      <PetCard />
      <NewArrivals />
      
      <FurrmaaPetAI />
      <BestDeal />
      <AboutFurrmaa />
      {/* <TrendingPetFeed /> */}
      <Feedback />
      <WhyChooseFurrmaa />
    </div>
  );
}
