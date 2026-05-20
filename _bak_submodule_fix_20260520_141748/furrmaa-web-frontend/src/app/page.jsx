"use client"
import AboutFurrmaa from "@/components/AboutFurrmaa";
import Banner from "@/components/Banner";
import BestDeal from "@/components/BestDeal";
import Card from "@/components/Card";
import Everyday from "@/components/Everyday";
import Feedback from "@/components/Feedback";
import FurrmaaPetAI from "@/components/FurrmaaPetAI";
import PetCard from "@/components/PetCard";
import NewArrivals from "@/components/NewArrivals";
import TopSelling from "@/components/TopSelling";
import ToggleDogCat from "@/components/ToggleDogCat";
import TrendingPetFeed from "@/components/TrendingPetFeed";
import Wellness from "@/components/Wellness";
import WhyChooseFurrmaa from "@/components/WhyChooseFurrmaa";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <div className=" bg-white text-black" >
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
    </>
  );
}


// "use client"
// import AboutFurrmaa from "@/components/AboutFurrmaa";
// import Banner from "@/components/Banner";
// import BestDeal from "@/components/BestDeal";
// import Card from "@/components/Card";
// import Everyday from "@/components/Everyday";
// import Feedback from "@/components/Feedback";
// import FurrmaaPetAI from "@/components/FurrmaaPetAI";
// import PetCard from "@/components/PetCard";
// import NewArrivals from "@/components/NewArrivals";
// import TopSelling from "@/components/TopSelling";
// import ToggleDogCat from "@/components/ToggleDogCat";
// import TrendingPetFeed from "@/components/TrendingPetFeed";
// import Wellness from "@/components/Wellness";
// import WhyChooseFurrmaa from "@/components/WhyChooseFurrmaa";
// import Image from "next/image";
// import { useState } from "react";

// export default function Home() {
// const [pet, setPet] = useState("dog");
// // console.log(pet);
//   return (
//     <>
//       <div className=" bg-white text-black" >
//         <Banner pet={pet} />
//         <ToggleDogCat active={pet} onChange={setPet} />
//         <Everyday pet={pet}/>
//         <Wellness pet={pet}/>
//         <Card pet={pet}/>
//         <TopSelling pet={pet}/>
//         <PetCard />
//         <NewArrivals pet={pet} />
//         <AboutFurrmaa />
//         <FurrmaaPetAI />
//         <BestDeal pet={pet} />
//         <TrendingPetFeed />
//         <Feedback />
//         <WhyChooseFurrmaa />
//       </div>
//     </>
//   );
// }

