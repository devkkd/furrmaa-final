"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { fetchSocialPosts } from "@/lib/api";

import "swiper/css";
import "swiper/css/navigation";

function toFeedItem(post) {
  const image = post.images?.[0];
  const video = post.videos?.[0];
  if (!image && !video) return null;

  const userName = post.user?.name || "Pet Parent";
  const preview =
    (post.content || "").trim().slice(0, 80) ||
    (video ? "Watch this pet moment" : "Trending pet story");

  return {
    id: post._id,
    image,
    video,
    title: preview,
    userName,
    likes: post.likes?.length || 0,
  };
}

export default function TrendingPetFeed() {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSocialPosts()
      .then((list) => {
        if (cancelled) return;
        const items = (list || [])
          .map(toFeedItem)
          .filter(Boolean)
          .slice(0, 20);
        setFeedItems(items);
      })
      .catch(() => {
        if (!cancelled) setFeedItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <p className="text-xl font-bold text-gray-900 mb-8">
          Trending Pet Feed
        </p>

        <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Watch What&apos;s Making Pets Famous Today
          <span>🐾</span>
        </h2>

        <p className="text-gray-900 max-w-3xl mb-10">
          Explore the most loved pet videos and moments shared by the Furrmaa
          community. From playful pups to curious cats, discover what&apos;s trending
          right now—and get inspired to share your own pet&apos;s story.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading trending feed...</p>
        ) : feedItems.length === 0 ? (
          <div className="text-gray-500">
            <p>No trending feed yet. Users can post from the app or web Pet Social.</p>
            <Link href="/social" className="inline-block mt-3 text-[#1F2E46] font-medium hover:underline">
              Go to Pet Social →
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              className="trending-feed-prev flex shrink-0 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 min-w-0 overflow-hidden">
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1.15}
                slidesPerGroup={1}
                navigation={{
                  prevEl: ".trending-feed-prev",
                  nextEl: ".trending-feed-next",
                }}
                breakpoints={{
                  480: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 3, spaceBetween: 24 },
                  1024: { slidesPerView: 4, spaceBetween: 28 },
                  1280: { slidesPerView: 5, spaceBetween: 32 },
                }}
              >
                {feedItems.map((item) => (
                  <SwiperSlide key={item.id}>
                    <Link
                      href="/social"
                      className="relative group block rounded-3xl overflow-hidden shadow-sm h-[380px] md:h-[420px]"
                    >
                      {item.video && !item.image ? (
                        <video
                          src={item.video}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {(item.video || item.image) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition">
                            <FaPlay className="ml-0.5" />
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-xs font-medium text-white/80 mb-1">{item.userName}</p>
                        <p className="text-sm font-semibold line-clamp-2 mb-3">{item.title}</p>
                        <span className="inline-flex bg-white text-slate-900 text-sm px-5 py-2 rounded-full font-medium">
                          See Feed →
                        </span>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <button
              type="button"
              className="trending-feed-next flex shrink-0 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
