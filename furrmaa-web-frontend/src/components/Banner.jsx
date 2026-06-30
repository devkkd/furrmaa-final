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
        title: "Furrmaa Pet Care",
        heading: "Everything Your Pet Needs.",
        subHeading: "One Caring Platform.",
        description: "Smart pet care for dogs and cats. Shop essentials, train better, stay healthy and connect socially.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-02.png",
        title: "Furrmaa Dogs",
        heading: "Premium Dog Food",
        subHeading: "High Protein • Balanced Diet",
        description: "Fuel your dog with high-quality and nutritious meals.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-05.png",
        title: "Furrmaa Dogs",
        heading: "Dog Grooming Range",
        subHeading: "Clean • Fresh • Safe",
        description: "Keep your dog clean and fresh with safe grooming kits.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-07.png",
        title: "Furrmaa Dogs",
        heading: "Comfortable Dog Beds",
        subHeading: "Soft • Cozy • Durable",
        description: "Give your dog the comfort they truly deserve.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-10.png",
        title: "Furrmaa Dogs",
        heading: "Dog Training Essentials",
        subHeading: "Smart • Effective • Easy",
        description: "Train your dog with the right tools and techniques.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-11.png",
        title: "Furrmaa Dogs",
        heading: "Travel with Dogs",
        subHeading: "Safe • Easy • Comfortable",
        description: "Make traveling with your dog smooth and stress-free.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Dog-Banner-12.png",
        title: "Furrmaa Dogs",
        heading: "Dog Feeding Essentials",
        subHeading: "Bowls • Feeders • Storage",
        description: "Smart feeding solutions for your dog's daily routine.",
        button: "SHOP NOW →",
      },
    ];

    const catBanners = [
      {
        image: "/images/banner/Cat-Banner-02.png",
        title: "Furrmaa Cats",
        heading: "Everything Your Cat Needs.",
        subHeading: "One Caring Platform.",
        description: "Premium care and essentials for your lovely cat.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Cat-Banner-03.png",
        title: "Furrmaa Cats",
        heading: "Cat Daily Essentials",
        subHeading: "Litter • Toys • Care",
        description: "All daily needs for your cat in one place.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Cat-Banner-04.png",
        title: "Furrmaa Cats",
        heading: "Cat Comfort Products",
        subHeading: "Soft • Cozy • Relaxing",
        description: "Give your cat the comfort they deserve.",
        button: "SHOP NOW →",
      },
      {
        image: "/images/banner/Cat-Banner-05.png",
        title: "Furrmaa Cats",
        heading: "Fun Cat Toys",
        subHeading: "Play • Engage • Enjoy",
        description: "Keep your cat active and entertained all day.",
        button: "SHOP NOW →",
      },
    ];

    return petType === "cat" ? catBanners : dogBanners;
  }, [petType]);

  return (
    <div className="w-full py-6 bannerWrapper">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={true}
        loopAdditionalSlides={3}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 1.15,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 1.25,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 1.3,
            spaceBetween: 28,
          },
        }}
        className="bannerSwiper"
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative h-[280px] md:h-[450px] rounded-[24px] overflow-hidden bg-cover bg-center flex items-center"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative z-10 max-w-xl px-8 md:px-14 text-black">
                <p className="text-base md:text-lg font-semibold mb-2">
                  {item.title}
                </p>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  {item.heading}
                  <br />
                  {item.subHeading}
                </h1>
                <p className="mt-4 text-sm md:text-base text-black/70 max-w-md">
                  {item.description}
                </p>
                <button className="mt-6 bg-white hover:bg-black hover:text-white transition-all duration-300 px-8 py-3 rounded-full font-semibold shadow">
                  {item.button}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .bannerWrapper {
          overflow: hidden;
        }

        /* allow side slides to bleed out */
        .bannerWrapper .swiper {
          overflow: visible;
        }

        /* inactive slides */
        .bannerSwiper .swiper-slide {
          transition: transform 0.4s ease, opacity 0.4s ease;
          transform: scale(0.92);
          opacity: 0.65;
        }

        /* active center slide */
        .bannerSwiper .swiper-slide-active {
          transform: scale(1);
          opacity: 1;
        }

        /* adjacent prev/next — fully visible but slightly scaled */
        .bannerSwiper .swiper-slide-prev,
        .bannerSwiper .swiper-slide-next {
          transform: scale(0.95);
          opacity: 0.85;
        }

        /* pagination dots */
        .bannerSwiper .swiper-pagination {
          bottom: 16px !important;
        }

        .bannerSwiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #fff;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .bannerSwiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 999px;
          background: #fff;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
