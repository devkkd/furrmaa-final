"use client"
import dynamic from "next/dynamic";
import Banner from "@/components/Banner";
import ToggleDogCat from "@/components/ToggleDogCat";
import Everyday from "@/components/Everyday";
import Wellness from "@/components/Wellness";
import Card from "@/components/Card";
import TopSelling from "@/components/TopSelling";

const PetCard = dynamic(() => import("@/components/PetCard"), { loading: () => null });
const NewArrivals = dynamic(() => import("@/components/NewArrivals"), { loading: () => null });
const AboutFurrmaa = dynamic(() => import("@/components/AboutFurrmaa"), { loading: () => null });
const FurrmaaPetAI = dynamic(() => import("@/components/FurrmaaPetAI"), { loading: () => null });
const BestDeal = dynamic(() => import("@/components/BestDeal"), { loading: () => null });
const TrendingPetFeed = dynamic(() => import("@/components/TrendingPetFeed"), { loading: () => null });
const Feedback = dynamic(() => import("@/components/Feedback"), { loading: () => null });
const WhyChooseFurrmaa = dynamic(() => import("@/components/WhyChooseFurrmaa"), { loading: () => null });

export default function Home() {
  return (
    <div className="bg-white text-black">
      <Banner />
      <ToggleDogCat />
      <Everyday />
      <Wellness />
      <Card />
      <TopSelling />
      <PetCard />
      <NewArrivals />
      <AboutFurrmaa />
      <FurrmaaPetAI />
      <BestDeal />
      <TrendingPetFeed />
      <Feedback />
      <WhyChooseFurrmaa />
    </div>
  );
}
