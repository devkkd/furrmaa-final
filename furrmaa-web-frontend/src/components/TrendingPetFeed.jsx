"use client";

import React, { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { fetchExploreContent } from "@/lib/api";
import { usePetStore } from "@/store/petStore";

function toFeedItem(item) {
  return {
    id: item._id,
    image: item.image,
    title: item.title || "Trending Pet Story",
  };
}

export default function TrendingPetFeed() {
  const petType = usePetStore((state) => state.petType);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchExploreContent({ type: "video", featured: true, petType: petType || "dog" })
      .then((list) => {
        if (cancelled) return;
        const items = (list || []).filter((x) => x.image).slice(0, 8).map(toFeedItem);
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
  }, [petType]);

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Trending Pet Feed
        </p>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Watch What’s Making Pets Famous Today
          <span>🐾</span>
        </h2>

        <p className="text-gray-900 max-w-3xl mb-14">
          Explore the most loved pet videos and moments shared by the Furrmaa
          community. From playful pups to curious cats, discover what’s trending
          right now—and get inspired to share your own pet’s story.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading trending feed...</p>
        ) : feedItems.length === 0 ? (
          <p className="text-gray-500">No trending feed available right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-3xl overflow-hidden shadow-sm"
            >
              <img
                src={item.image}
                alt="Trending Pet"
                className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                  <FaPlay />
                </div>
              </div>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                <button className="bg-slate-900 text-white text-sm px-5 py-2 rounded-full flex items-center gap-1 hover:bg-slate-800 transition">
                  See Feed →
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

      </div>
    </section>
  );
}
