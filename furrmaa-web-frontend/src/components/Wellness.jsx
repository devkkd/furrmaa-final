"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { usePetStore } from "@/store/petStore";
import { fetchMainCategories } from "@/lib/api";
import { AdminImage } from "@/app/admin/components/AdminImage";
import LogoLoader from "@/components/LogoLoader";

function titleToCategory(title) {
  const slug = (title || "").toLowerCase().trim();
  if (slug === "medicine") return "health";
  return slug;
}

/** Map API category to grid item */
function mapCategory(item) {
  const title = item.name || item.title;
  const image = item.image || item.img;
  const slug = item.slug || titleToCategory(title);
  return { title, img: image, slug, _id: item._id };
}

const isOther = (name, slug) => {
  const s = (slug || (name || "").toLowerCase().trim()).toLowerCase();
  return s === "other";
};

export default function Wellness() {
  const petType = usePetStore((state) => state.petType);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile();

  window.addEventListener("resize", checkMobile);

  return () => window.removeEventListener("resize", checkMobile);
}, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMainCategories({ section: 'wellness', petType: petType || 'dog' })
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          const active = list.filter((c) => c.isActive !== false);
          setData(active.map(mapCategory).filter((c) => !isOther(c.title, c.slug)));
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
}, [petType]);

const displayData = data;

return (
    <section className="w-full py-10">
      
     <h2 className="text-[26px] md:text-3xl font-bold text-left md:text-center mb-6 md:mb-10 text-gray-900 px-4 md:px-0">
        All Round Wellness
      </h2>

      {loading ? (
        <LogoLoader />
      ) : (
      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center gap-2 md:gap-6">
        {data.length > 0 ? (
          <>
            {/* Custom Previous Button - Now visible on mobile */}
            <button
              className="wellness-prev hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            {/* Swiper Container */}
         {isMobile ? (
  <div className="w-full grid grid-cols-4 gap-3">
    {data.slice(0, 8).map((item, index) => {
      const title = item.title || item.name;
      const image = item.img || item.image;
      const categorySlug = item.slug || titleToCategory(title);

      return (
        <Link
          key={item._id || item.id || index}
          href={`/shop?category=${categorySlug}${
            petType ? `&petType=${petType}` : ""
          }`}
          className="group flex flex-col items-center"
        >
          <div className="w-full bg-[#FCEBFF] rounded-2xl p-2 aspect-square flex items-center justify-center">
            <AdminImage
              src={image}
              alt={title}
              className="w-full h-full max-h-[55px] object-contain"
            />
          </div>

          <p className="text-[11px] text-center mt-2 leading-tight font-medium text-gray-800">
            {title}
          </p>
        </Link>
      );
    })}
  </div>
) : (
  <div className="w-full overflow-hidden">
    <Swiper
      modules={[Navigation]}
      spaceBetween={16}
      slidesPerView={4}
      navigation={{
        prevEl: ".wellness-prev",
        nextEl: ".wellness-next",
      }}
      breakpoints={{
        640: {
          slidesPerView: 4,
          spaceBetween: 12,
        },
        768: {
          slidesPerView: 5,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: 6,
          spaceBetween: 16,
        },
        1280: {
          slidesPerView: 8,
          spaceBetween: 16,
        },
      }}
    >
      {displayData.map((item, index) => {
        const title = item.title || item.name;
        const image = item.img || item.image;
        const categorySlug = item.slug || titleToCategory(title);

        return (
          <SwiperSlide key={item._id || item.id || index}>
            <Link
              href={`/shop?category=${categorySlug}${
                petType ? `&petType=${petType}` : ""
              }`}
              className="group flex flex-col items-center block w-full h-full"
            >
              <div className="w-full bg-[#FCEBFF] rounded-2xl p-2 md:p-4 flex items-center justify-center transition-shadow duration-300 group-hover:shadow-md aspect-square md:h-[160px]">
                <AdminImage
                  src={image}
                  alt={title}
                  className="h-full max-h-[70px] md:max-h-[120px] object-contain w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <p className="text-[11px] md:text-sm font-medium text-gray-800 text-center mt-2 md:mt-3 leading-tight">
                {title}
              </p>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  </div>
)}

            {/* Custom Next Button - Now visible on mobile */}
            <button
              className="wellness-next hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500 w-full">No categories available</div>
        )}
      </div>
      )}
    </section>
  );
}