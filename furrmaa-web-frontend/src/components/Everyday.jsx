'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { usePetStore } from '@/store/petStore';
import { fetchMainCategories } from '@/lib/api';
import { AdminImage } from '@/app/admin/components/AdminImage';
import { dogEverydayData, catEverydayData } from '@/data/everyday';

function titleToCategory(title) {
  const slug = (title || '').toLowerCase().trim();
  if (slug === 'medicine') return 'health';
  return slug;
}

function mapCategory(item) {
  const title = item.name || item.title;
  const image = item.image || item.img;
  const slug = item.slug || titleToCategory(title);
  return { title, img: image, slug, _id: item._id };
}

function isOther(name, slug) {
  const s = (slug || (name || '').toLowerCase().trim()).toLowerCase();
  return s === 'other';
}

function staticFallback(petType) {
  const list = petType === 'cat' ? catEverydayData : dogEverydayData;
  return list.map((item, i) => ({
    title: item.title,
    img: item.img,
    slug: titleToCategory(item.title),
    _id: `static-everyday-${i}`,
  }));
}

export default function Everyday() {
  const petType = usePetStore((state) => state.petType);
  const pt = petType || 'dog';
  // Instant paint — never block home on slow/cold API
  const [data, setData] = useState(() => staticFallback(pt));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setData(staticFallback(pt));

    fetchMainCategories({ section: 'everyday', petType: pt })
      .then((list) => {
        if (cancelled) return;
        const active = (Array.isArray(list) ? list : [])
          .filter((c) => c.isActive !== false)
          .map(mapCategory)
          .filter((c) => !isOther(c.title, c.slug));
        if (active.length > 0) setData(active);
      })
      .catch(() => {
        /* keep static fallback */
      });

    return () => {
      cancelled = true;
    };
  }, [pt]);

  return (
    <section className="w-full py-8 md:py-10">
      <h2 className="text-[26px] md:text-3xl font-bold text-left md:text-center mb-6 md:mb-8 text-gray-900 px-4 md:px-0">
        Everyday Essentials
      </h2>

      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center gap-2 md:gap-6">
        {data.length > 0 ? (
          <>
            <button
              className="everyday-prev hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            {isMobile ? (
              <div className="w-full grid grid-cols-4 gap-3">
                {data.slice(0, 8).map((item, index) => {
                  const title = item.title || item.name;
                  const image = item.img || item.image;
                  const categorySlug = item.slug || titleToCategory(title);
                  return (
                    <Link
                      key={item._id || item.id || index}
                      href={`/shop?category=${categorySlug}${pt ? `&petType=${pt}` : ''}`}
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
                    prevEl: '.everyday-prev',
                    nextEl: '.everyday-next',
                  }}
                  breakpoints={{
                    640: { slidesPerView: 4 },
                    768: { slidesPerView: 5 },
                    1024: { slidesPerView: 6 },
                    1280: { slidesPerView: 7 },
                  }}
                  className="w-full"
                >
                  {data.map((item, index) => {
                    const title = item.title || item.name;
                    const image = item.img || item.image;
                    const categorySlug = item.slug || titleToCategory(title);
                    return (
                      <SwiperSlide key={item._id || item.id || index}>
                        <Link
                          href={`/shop?category=${categorySlug}${pt ? `&petType=${pt}` : ''}`}
                          className="group flex flex-col items-center"
                        >
                          <div className="w-full bg-[#FCEBFF] rounded-2xl p-4 aspect-square flex items-center justify-center">
                            <AdminImage
                              src={image}
                              alt={title}
                              className="w-full h-full max-h-[90px] object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <p className="text-sm text-center mt-3 font-medium text-gray-800">{title}</p>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            )}

            <button
              className="everyday-next hidden md:flex shrink-0 w-12 h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </>
        ) : (
          <p className="text-gray-500 text-sm py-6">No categories yet.</p>
        )}
      </div>
    </section>
  );
}
