"use client";

import { usePetStore } from "@/store/petStore";

export default function Card() {
  const petType = usePetStore((state) => state.petType);
  const isDog = petType === "dog";

  const images = {
    card1: isDog ? "/images/dog-2.png"      : "/images/cat-2.png",
    card2: isDog ? "/images/dog-1.png"      : "/images/c2.png",
  };

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARD 1 — changes with pet toggle */}
        <div
          className="h-[300px] rounded-2xl overflow-hidden bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${images.card1})` }}
        />

        {/* CARD 2 — changes with pet toggle */}
        <div
          className="h-[300px] rounded-2xl overflow-hidden bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${images.card2})` }}
        />

      </div>
    </section>
  );
}
