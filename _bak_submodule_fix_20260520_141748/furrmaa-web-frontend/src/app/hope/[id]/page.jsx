"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { fetchHopePostById } from "@/lib/api";

export default function HopeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchHopePostById(id)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Container><p className="py-16 text-gray-500">Loading...</p></Container>;
  if (!post) return <Container><p className="py-16 text-gray-500">Post not found.</p><Link href="/hope" className="text-[#1F2E46] font-bold">← Back to Hope</Link></Container>;

  const imageUrl = post.images && post.images[0];
  const hasMultipleImages = post.images && post.images.length > 1;
  const emoji = post.petType === "dog" ? "🐕" : post.petType === "cat" ? "🐱" : "🐾";

  return (
    <div className="bg-white py-8">
      <Container>
        <Link href="/hope" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1F2E46] font-medium mb-8">
          ← Back to Hope
        </Link>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-video bg-gray-100 flex items-center justify-center text-8xl">
              {imageUrl ? (
                <img src={imageUrl} alt={post.petName} className="w-full h-full object-cover" />
              ) : (
                emoji
              )}
            </div>
            {hasMultipleImages && (
              <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                {post.images.map((src, idx) => (
                  <img key={idx} src={src} alt={`${post.petName} ${idx + 1}`} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ))}
              </div>
            )}
            <div className="p-6 md:p-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#a3e635] text-black mb-4">
                {post.postType === "lostFound" ? "Lost & Found" : "Adoption"}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{post.petName}</h1>
              {post.petAgeText && <p className="text-gray-600 mb-2">{post.petAgeText}</p>}
              {post.locationText && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">📍 {post.locationText}</p>
              )}
              {post.description && (
                <div className="prose prose-sm max-w-none text-gray-700 mt-4">
                  <p>{post.description}</p>
                </div>
              )}
              {post.user && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
                  {post.user.profileImage ? (
                    <img src={post.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {post.user.name?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{post.user.name}</p>
                    {post.user.phone && <p className="text-sm text-gray-500">{post.user.phone}</p>}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-6">To respond, download the Furrmaa app.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
