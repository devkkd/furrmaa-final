"use client";

import { usePetStore } from "@/store/petStore";

export default function Card({ show = "both" }) {
  const petType = usePetStore((state) => state.petType);
  const isDog = petType === "dog";

  const images = {
    card1: isDog ? "/images/dog-2.png"      : "/images/cat-2.png",
    card2: isDog ? "/images/dog-1.png"      : "/images/c2.png",
  };

  return (
   <section className="w-full pt-6 pb-0 md:py-10">
     <div className="max-w-7xl mx-auto px-5 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* CARD 1 — changes with pet toggle */}
   
         <div
  className={`
    h-[180px] md:h-[300px]
    rounded-[20px] md:rounded-2xl
    overflow-hidden
    bg-cover bg-center
    transition-all duration-500
    ${
      show === "second"
        ? "hidden md:block"
        : ""
    }
  `}
          style={{ backgroundImage: `url(${images.card1})` }}
        />

        {/* CARD 2 — changes with pet toggle */}
        <div
  className={`
    h-[180px] md:h-[300px]
    rounded-[20px] md:rounded-2xl
    overflow-hidden
    bg-cover bg-center
    transition-all duration-500
    ${
      show === "first"
        ? "hidden md:block"
        : ""
    }
  `}
          style={{ backgroundImage: `url(${images.card2})` }}
        />

      </div>
    </section>
  );
}
