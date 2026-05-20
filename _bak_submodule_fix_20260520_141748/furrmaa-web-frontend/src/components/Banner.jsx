"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { usePetStore } from "@/store/petStore";

export default function Banner() {
  const petType = usePetStore((state) => state.petType);

  const banners = useMemo(() => {
    const dogBanners = [
      {
        image: "/images/banner/Dog-Banner-01.png",
        title: "Furrmaa Dogs",
        heading: "Complete Care for Dogs",
        subHeading: "Nutrition • Grooming • Wellness",
        description: "All-in-one solutions to keep your dog healthy and active.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Dog-Banner-02.png",
        title: "Furrmaa Dogs",
        heading: "Premium Dog Food",
        subHeading: "High Protein • Balanced Diet",
        description: "Fuel your dog with high-quality and nutritious meals.",
        button: "EXPLORE →",
      },
      
   
      {
        image: "/images/banner/Dog-Banner-05.png",
        title: "Furrmaa Dogs",
        heading: "Dog Grooming Range",
        subHeading: "Clean • Fresh • Safe",
        description: "Keep your dog clean and fresh with safe grooming kits.",
        button: "EXPLORE →",
      },
     
      {
        image: "/images/banner/Dog-Banner-07.png",
        title: "Furrmaa Dogs",
        heading: "Comfortable Dog Beds",
        subHeading: "Soft • Cozy • Durable",
        description: "Give your dog the comfort they truly deserve.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Dog-Banner-10.png",
        title: "Furrmaa Dogs",
        heading: "Dog Training Essentials",
        subHeading: "Smart • Effective • Easy",
        description: "Train your dog with the right tools and techniques.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Dog-Banner-11.png",
        title: "Furrmaa Dogs",
        heading: "Travel with Dogs",
        subHeading: "Safe • Easy • Comfortable",
        description: "Make traveling with your dog smooth and stress-free.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Dog-Banner-12.png",
        title: "Furrmaa Dogs",
        heading: "Dog Feeding Essentials",
        subHeading: "Bowls • Feeders • Storage",
        description: "Smart feeding solutions for your dog’s daily routine.",
        button: "EXPLORE →",
      },
    
    ];

    const catBanners = [
      {
        image: "/images/banner/Cat-Banner-01.png",
        title: "Furrmaa Cats",
        heading: "Healthy Cat Lifestyle",
        subHeading: "Care • Comfort • Nutrition",
        description: "Ensure your cat lives a happy and healthy life.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Cat-Banner-02.png",
        title: "Furrmaa Cats",
        heading: "Premium Cat Food",
        subHeading: "Tasty • Balanced • Safe",
        description: "Delicious meals packed with essential nutrients.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Cat-Banner-03.png",
        title: "Furrmaa Cats",
        heading: "Cat Daily Essentials",
        subHeading: "Litter • Toys • Care",
        description: "All daily needs for your cat in one place.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Cat-Banner-04.png",
        title: "Furrmaa Cats",
        heading: "Cat Comfort Products",
        subHeading: "Soft • Cozy • Relaxing",
        description: "Give your cat the comfort they deserve.",
        button: "EXPLORE →",
      },
      {
        image: "/images/banner/Cat-Banner-05.png",
        title: "Furrmaa Cats",
        heading: "Fun Cat Toys",
        subHeading: "Play • Engage • Enjoy",
        description: "Keep your cat active and entertained all day.",
        button: "EXPLORE →",
      },
    ];

    return petType === "cat" ? catBanners : dogBanners;
  }, [petType]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center px-4 pt-6">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        loop
        className="w-full max-w-7xl"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="
                relative w-full
                min-h-[380px] md:min-h-[450px]
                rounded-2xl overflow-hidden
                bg-cover bg-right md:bg-center bg-no-repeat
                flex items-center
              "
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 backdrop-blur-sm md:hidden" />

              <div className="relative z-10 w-full md:w-1/2 px-6 md:px-14 text-center md:text-left space-y-4">
                <p className="text-lg font-bold text-black">
                  {item.title}
                </p>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-black">
                  {item.heading}
                  <br />
                  {item.subHeading}
                </h1>

                <p className="text-sm md:text-base text-black/70 max-w-md mx-auto md:mx-0">
                  {item.description}
                </p>

                <button className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition">
                  {item.button}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}