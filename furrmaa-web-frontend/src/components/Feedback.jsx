"use client";

import React, { useEffect, useState } from "react";
import { fetchFeaturedFeedback } from "@/lib/api";

function toCard(item) {
  return {
    id: item._id,
    title: item.subject || "Great Furrmaa experience",
    text: item.message || "",
    name: item.name || "Furrmaa Community",
    role: item.role || "Pet Parent",
    rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
  };
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Happy Customer Feedback
        </p>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Trusted by Pet Parents Who Truly Care
        </h2>

        <p className="text-gray-700 max-w-3xl mb-14">
          Thousands of pet parents rely on Furrmaa every day to keep their pets
          healthy, happy, and safe. Here&apos;s what our community has to say.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-500">No community feedback available right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">
                  &ldquo;{item.title}&rdquo;
                </h4>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="text-sm font-semibold text-gray-900">
                  {item.name}{" "}
                  <span className="font-normal text-gray-500">
                    &ndash; {item.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
