"use client";

import React, { useEffect, useState } from "react";
import { fetchFeaturedFeedback } from "@/lib/api";
import LogoLoader from "@/components/LogoLoader";

function toCard(item) {
  return {
    id: item._id,
    title: item.subject || "Great Furrmaa Experience",
    text: item.message || "",
    name: item.name || "Furrmaa Community",
    role: item.role || "Pet Parent",
    rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
  };
}

const Card = ({ item }) => (
  <div className="w-[290px] md:w-[380px] shrink-0 rounded-[20px] md:rounded-3xl bg-white p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
    <div className="flex gap-1 text-yellow-400 text-[18px] md:text-xl mb-3 md:mb-5">
      {Array.from({ length: item.rating }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>

    <h3 className="font-bold text-[16px] md:text-lg text-gray-900 mb-2 md:mb-4 leading-snug">
      "{item.title}"
    </h3>

    <p className="text-[13px] md:text-md text-gray-600 leading-6 md:leading-8 mb-5 md:mb-8 line-clamp-5">
      "{item.text}"
    </p>

    <h5 className="font-semibold text-[13px] md:text-md text-gray-900">
      {item.name}
      <span className="font-normal text-gray-500">
        {" "}
        - {item.role}
      </span>
    </h5>
  </div>
);

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchFeaturedFeedback(8)
      .then((list) => {
        if (cancelled) return;
        setFeedbacks((list || []).map(toCard));
      })
      .catch(() => {
        if (!cancelled) setFeedbacks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const middle = Math.ceil(feedbacks.length / 2);

  const row1 = feedbacks.slice(0, middle);
  const row2 = feedbacks.slice(middle);

  // Duplicate multiple times for smooth marquee
  const marqueeRow1 = [...row1, ...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2, ...row2];

  return (
    <section className="py-10 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-6 mb-8 md:mb-16">
        <p className="font-semibold text-[13px] md:text-sm mb-2 md:mb-3 text-gray-900">
          Happy Customer Feedback
        </p>

        <h2 className="text-[24px] md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
          Trusted by Pet Parents Who Truly Care
        </h2>

        <p className="text-[14px] md:text-lg leading-6 md:leading-8 text-gray-600 max-w-3xl">
          Thousands of pet parents rely on Furrmaa every day to keep their pets
          healthy, happy, and safe. Here's what our community has to say.
        </p>
      </div>

      {loading ? (
        <LogoLoader />
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          No community feedback available right now.
        </div>
      ) : (
        <>
          {/* Row 1 */}
          <div className="marquee">
            <div className="marquee-track">
              {marqueeRow1.map((item, i) => (
                <Card key={`${item.id}-top-${i}`} item={item} />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="marquee reverse mt-4 md:mt-8">
            <div className="marquee-track">
              {marqueeRow2.map((item, i) => (
                <Card key={`${item.id}-bottom-${i}`} item={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}