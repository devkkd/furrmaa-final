"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { usePetStore } from "@/store/petStore";
import { fetchAllCategories } from "@/lib/api";
import { AdminImage } from "@/app/admin/components/AdminImage";

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

  useEffect(() => {
    let cancelled = false;
    fetchAllCategories()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          const active = list.filter((c) => c.isActive !== false);
          setData(active.map(mapCategory).filter((c) => !isOther(c.title, c.slug)));
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full py-10">
      <h2 className="text-[28px] md:text-3xl font-bold text-center mb-10 text-gray-900">
        All Round Wellness
      </h2>

      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center gap-2 md:gap-6">
        {data.length > 0 ? (
          <>
            {/* Custom Previous Button - using class 'wellness-prev' */}
            <button
              className="wellness-prev hidden sm:flex shrink-0 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            {/* Swiper Container */}
            <div className="w-full overflow-hidden">
              <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={2}
                navigation={{
                  prevEl: '.wellness-prev', // Tied to the CSS class above
                  nextEl: '.wellness-next', // Tied to the CSS class below
                }}
                breakpoints={{
                  480: { slidesPerView: 3 },
                  640: { slidesPerView: 4 },
                  768: { slidesPerView: 5 },
                  1024: { slidesPerView: 6 },
                  1280: { slidesPerView: 8 },
                }}
              >
                {data.map((item, index) => {
                  const title = item.title || item.name;
                  const image = item.img || item.image;
                  const categorySlug = item.slug || titleToCategory(title);
                  return (
                    <SwiperSlide key={item._id || item.id || index}>
                      <Link
                        href={`/shop?category=${categorySlug}${petType ? `&petType=${petType}` : ""}`}
                        className="group flex flex-col items-center block w-full h-full"
                      >
                        {/* Image Box */}
                        <div className="w-full bg-[#FCEBFF] rounded-2xl p-4 flex items-center justify-center cursor-pointer transition-shadow duration-300 group-hover:shadow-md aspect-square md:aspect-auto md:h-[160px]">
                          <AdminImage
                            src={image}
                            alt={title || ""}
                            className="h-full max-h-[120px] object-contain w-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        {/* Title */}
                        <p className="text-[13px] md:text-sm font-medium text-gray-800 text-center mt-3">
                          {title}
                        </p>
                      </Link>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            {/* Custom Next Button - using class 'wellness-next' */}
            <button
              className="wellness-next hidden sm:flex shrink-0 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500 w-full">No categories available</div>
        )}
      </div>
    </section>
  );
}