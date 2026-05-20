"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { HiOutlineLocationMarker, HiOutlineSearch } from "react-icons/hi";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import WhyChooseFurrmaa from "@/components/WhyChooseFurrmaa";
import { fetchHopePosts } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";

const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#a3e635" />
    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function HopePageContent() {
  const searchParams = useSearchParams();
  const filterFromUrl = searchParams?.get("filter");
  const initialCat = filterFromUrl === "lostFound" ? "Lost & Found" : filterFromUrl === "adoption" ? "Adoption" : "All";
  const [activeCategory, setActiveCategory] = useState(initialCat);
  useEffect(() => {
    if (filterFromUrl === "lostFound") setActiveCategory("Lost & Found");
    else if (filterFromUrl === "adoption") setActiveCategory("Adoption");
    else setActiveCategory("All");
  }, [filterFromUrl]);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const { location, loading: locLoading, error: locError, fetchCurrentLocation, setLocation } = useGeolocation("");

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  const handleUseMyLocation = async () => {
    const addr = await fetchCurrentLocation();
    if (addr) setShowLocationModal(false);
  };
  const handleUseManualLocation = () => {
    const val = manualLocation.trim();
    if (val) {
      setLocation(val);
      setShowLocationModal(false);
      setManualLocation("");
    }
  };

  const params = useMemo(() => {
    const p = {};
    // When "All" is selected, don't filter by postType or petType - show all posts
    if (activeCategory === "Dog") {
      p.petType = "dog";
      p.postType = "adoption";
    } else if (activeCategory === "Cat") {
      p.petType = "cat";
      p.postType = "adoption";
    } else if (activeCategory === "Lost & Found") {
      p.postType = "lostFound";
    } else if (activeCategory === "Adoption") {
      p.postType = "adoption";
    }
    // Only add location filter if location is set
    if (location && location.trim()) {
      const locationValue = location.split(",")[0]?.trim();
      if (locationValue) p.location = locationValue;
    }
    // Only add search filter if search query is not empty
    if (searchQuery && searchQuery.trim()) {
      p.search = searchQuery.trim();
    }
    return p;
  }, [activeCategory, location, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    // Always fetch posts, even with empty params (to get all posts)
    fetchHopePosts(params)
      .then((data) => {
        if (!cancelled) {
          const postsArray = Array.isArray(data) ? data : [];
          setPosts(postsArray);
          if (postsArray.length === 0 && !params.postType && !params.petType && !params.location && !params.search) {
            console.info('No posts found. This might be normal if the database is empty.');
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching Hope posts:', err);
        if (!cancelled) {
          setPosts([]);
          setError('Failed to load posts. Please try again later.');
          console.warn('Failed to fetch Hope posts. Check API endpoint and network connection.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [params]);

  const categories = ["All", "Dog", "Cat", "Lost & Found", "Adoption"];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="mx-auto px-6 py-8 md:py-12">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8">
              <header>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Hope by Furrmaa</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Helping Pets Find Safety, Care, and a Home</h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Hope connects pet parents, rescuers, and adopters to support pets who are{" "}
                  <span className="font-bold text-gray-900">lost, found, or waiting for adoption</span> all in one trusted place.
                </p>
              </header>
              <ul className="space-y-3">
                {["Lost pets", "Found pets", "Pets available for adoption"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">To add a Hope post, download the Furrmaa mobile app.</p>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                    <FaApple className="text-xl" />
                    <span className="text-sm font-medium">App Store</span>
                  </button>
                  <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                    <FaGooglePlay className="text-xl" />
                    <span className="text-sm font-medium">Google Play</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-[280px] md:w-[380px]">
                <img
                  src="/images/Hopes/hopeByFurrmaa.png"
                  alt="Furrmaa Hope"
                  width={380}
                  height={700}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Browse Posts Section */}
      <section className="border-t border-gray-200 py-8">
        <Container>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Browse Hope Posts</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search pets, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <HiOutlineLocationMarker className="text-gray-400 text-lg" />
                <span className="text-sm text-gray-600 truncate max-w-[140px]">
                  {locLoading ? "Getting location..." : location || "Select location"}
                </span>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                disabled={locLoading}
                className="bg-[#95E562] text-black text-xs font-bold px-3 py-2 rounded-lg uppercase hover:opacity-90 disabled:opacity-60"
              >
                Change
              </button>
            </div>
            {showLocationModal && (
              <>
                <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowLocationModal(false)} />
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Set your location</h3>
                  {locError && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">{locError}</p>
                  )}
                  <button
                    onClick={handleUseMyLocation}
                    disabled={locLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#95E562] text-black font-semibold rounded-xl mb-3 disabled:opacity-60"
                  >
                    {locLoading ? "Getting..." : "Use my current location"}
                  </button>
                  <p className="text-xs text-gray-500 mb-2">Or enter manually</p>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseManualLocation}
                      disabled={!manualLocation.trim()}
                      className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      Use this location
                    </button>
                    <button
                      onClick={() => setShowLocationModal(false)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat ? "bg-[#1F2E46] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-500 py-12 text-center">Loading posts...</p>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchHopePosts(params)
                    .then((data) => setPosts(Array.isArray(data) ? data : []))
                    .catch(() => setError('Failed to load posts. Please try again later.'))
                    .finally(() => setLoading(false));
                }}
                className="text-[#1F2E46] font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-2">No Hope posts found.</p>
              <p className="text-sm text-gray-400">
                {activeCategory !== "All" || location || searchQuery
                  ? "Try adjusting filters or check back later."
                  : "Be the first to add a Hope post via the Furrmaa mobile app."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/hope/${post._id}`}
                  className="block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-5xl">
                    {(post.images && post.images[0]) ? (
                      <img src={post.images[0]} alt={post.petName} className="w-full h-full object-cover" />
                    ) : (
                      post.petType === "dog" ? "🐕" : post.petType === "cat" ? "🐱" : "🐾"
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate">{post.petName || "Pet"}</h3>
                    <p className="text-sm text-gray-500">{post.petAgeText || "Age not specified"}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{post.locationText || "Location not specified"}</p>
                    <span className="inline-block mt-2 text-xs font-bold text-[#1F2E46]">
                      {post.postType === "lostFound" ? "Lost & Found" : "Adoption"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <WhyChooseFurrmaa />
    </div>
  );
}

export default function HopePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading...</div>}>
      <HopePageContent />
    </Suspense>
  );
}
