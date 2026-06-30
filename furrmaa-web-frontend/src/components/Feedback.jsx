"use client";

import React, { useEffect, useState } from "react";
import { fetchFeaturedFeedback } from "@/lib/api";

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
  <div className="w-[380px] shrink-0 rounded-3xl bg-white p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
    <div className="flex gap-1 text-yellow-400 text-xl mb-5">
      {Array.from({ length: item.rating }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>

    <h3 className="font-bold text-lg text-gray-900 mb-4">
      "{item.title}"
    </h3>

    <p className="text-gray-600 text-md leading-8 mb-8">
      "{item.text}"
    </p>

    <h5 className="font-semibold text-md text-gray-900">
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
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <p className="font-semibold text-sm mb-3 text-gray-900">
          Happy Customer Feedback
        </p>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Trusted by Pet Parents Who Truly Care
        </h2>

        <p className="text-gray-600 max-w-3xl text-lg">
          Thousands of pet parents rely on Furrmaa every day to keep their pets
          healthy, happy, and safe. Here's what our community has to say.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          Loading feedback...
        </div>
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
          <div className="marquee reverse mt-8">
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