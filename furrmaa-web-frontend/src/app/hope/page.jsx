"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
} from "react-icons/hi";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import WhyChooseFurrmaa from "@/components/WhyChooseFurrmaa";
import { fetchHopePosts } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPickerModal from "@/components/LocationPickerModal";

const CheckCircle = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    className="shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#a3e635" />
    <path
      d="M8 12L11 15L16 9"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function HopePageContent() {
  const searchParams = useSearchParams();

  const filterFromUrl = searchParams?.get("filter");
  const petFromUrl = searchParams?.get("pet");

  const initialPostType =
    filterFromUrl === "lostFound"
      ? "lostFound"
      : filterFromUrl === "adoption"
      ? "adoption"
      : "lostFound";

  const initialPetSub =
    petFromUrl === "dog" || petFromUrl === "cat" ? petFromUrl : "all";

  const [mainType, setMainType] = useState(initialPostType); // lostFound | adoption
  const [petSub, setPetSub] = useState(initialPetSub); // all | dog | cat
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (filterFromUrl === "lostFound") setMainType("lostFound");
    else if (filterFromUrl === "adoption") setMainType("adoption");
    if (petFromUrl === "dog" || petFromUrl === "cat" || petFromUrl === "all") {
      setPetSub(petFromUrl === "all" ? "all" : petFromUrl);
    }
  }, [filterFromUrl, petFromUrl]);

  const {
    location,
    loading: locLoading,
    error: locError,
    fetchCurrentLocation,
    setLocation,
  } = useGeolocation("");

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  const handleUseMyLocation = async () => {
    const addr = await fetchCurrentLocation();

    if (addr) {
      setShowLocationModal(false);
    }
  };

  const handleConfirmLocation = (val) => {
    setLocation(val);
    setShowLocationModal(false);
  };

  const params = useMemo(() => {
    const p = { postType: mainType };
    if (petSub === "dog" || petSub === "cat") {
      p.petType = petSub;
    }
    if (location && location.trim()) {
      p.location = location.trim();
    }
    if (searchQuery && searchQuery.trim()) {
      p.search = searchQuery.trim();
    }
    return p;
  }, [mainType, petSub, location, searchQuery]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchHopePosts(params)
      .then((data) => {
        if (!cancelled) {
          const postsArray = Array.isArray(data) ? data : [];

          setPosts(postsArray);

          if (
            postsArray.length === 0 &&
            !params.postType &&
            !params.petType &&
            !params.location &&
            !params.search
          ) {
            console.info(
              "No posts found. This might be normal if the database is empty."
            );
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching Hope posts:", err);

        if (!cancelled) {
          setPosts([]);
          setError(
            "Failed to load posts. Please try again later."
          );

          console.warn(
            "Failed to fetch Hope posts. Check API endpoint and network connection."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="mx-auto px-4 sm:px-5 md:px-6 py-7 sm:py-8 md:py-12">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-12">
            {/* HERO CONTENT */}
            <div className="flex-1 w-full space-y-6 sm:space-y-7 md:space-y-8">
              <header>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-5 md:mb-6 leading-tight">
                  Hope by Furrmaa
                </h1>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-snug">
                  Helping Pets Find Safety, Care, and a Home
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Hope connects pet parents, rescuers, and adopters
                  to support pets who are{" "}
                  <span className="font-bold text-gray-900">
                    lost, found, or waiting for adoption
                  </span>{" "}
                  all in one trusted place.
                </p>
              </header>

              {/* FEATURES */}
              <ul className="space-y-3">
                {[
                  "Lost pets",
                  "Found pets",
                  "Pets available for adoption",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle />

                    <span className="text-sm sm:text-base text-gray-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* APP DOWNLOAD */}
              <div className="pt-5 sm:pt-6 border-t border-gray-200">
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-6">
                  To add a Hope post, download the Furrmaa mobile
                  app.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                    <FaApple className="text-xl shrink-0" />

                    <span className="text-sm font-medium">
                      App Store
                    </span>
                  </button>

                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                    <FaGooglePlay className="text-xl shrink-0" />

                    <span className="text-sm font-medium">
                      Google Play
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <div className="relative w-[220px] sm:w-[280px] md:w-[380px] max-w-full">
                <img
                  src="/images/Hopes/hopeByFurrmaa.png"
                  alt="Furrmaa Hope"
                  width={380}
                  height={700}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= BROWSE POSTS ================= */}
    <section className="border-t border-gray-200 py-5 sm:py-8">
  <Container>
    {/* Heading */}
    <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-4 sm:mb-6">
      Browse Hope Posts
    </h2>

    {/* ================= SEARCH / LOCATION ================= */}
    <div className="w-full mb-4 sm:mb-6">
      {/* SEARCH BAR */}
      <div className="relative w-full">
        <HiOutlineSearch
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            text-lg
            sm:text-xl
            pointer-events-none
          "
        />

        <input
          type="text"
          placeholder="Search pets, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full
            h-11
            sm:h-12
            pl-10
            sm:pl-11
            pr-3
            sm:pr-4
            border
            border-gray-200
            rounded-xl
            bg-gray-50
            focus:outline-none
            focus:ring-1
            focus:ring-gray-300
            focus:border-gray-300
            text-[16px]
            sm:text-sm
            text-gray-800
            placeholder:text-gray-400
            transition
          "
        />
      </div>

      {/* LOCATION + CHANGE */}
      <div className="mt-2.5 sm:mt-4 flex items-center gap-2 w-full">
        {/* LOCATION BOX */}
        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            flex-1
            min-w-0
            h-11
            sm:h-12
            border
            border-gray-200
            rounded-xl
            px-2.5
            sm:px-3
            bg-white
            overflow-hidden
          "
        >
          <HiOutlineLocationMarker
            className="
              text-gray-400
              text-base
              sm:text-xl
              shrink-0
            "
          />

          <span
            className="
              text-xs
              sm:text-sm
              text-gray-600
              truncate
              min-w-0
            "
          >
            {locLoading
              ? "Getting location..."
              : location || "Select location"}
          </span>
        </div>

        {/* CHANGE BUTTON */}
        <button
          onClick={() => setShowLocationModal(true)}
          disabled={locLoading}
          className="
            shrink-0
            h-11
            sm:h-12
            bg-[#95E562]
            text-black
            text-[10px]
            sm:text-xs
            font-bold
            px-3
            sm:px-4
            rounded-xl
            uppercase
            whitespace-nowrap
            active:opacity-80
            hover:opacity-90
            disabled:opacity-60
            transition
          "
        >
          Change
        </button>
      </div>

      <LocationPickerModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleConfirmLocation}
        locLoading={locLoading}
        locError={locError}
        onUseCurrentLocation={handleUseMyLocation}
      />
    </div>

    {/* ================= CATEGORIES ================= */}
    <div className="w-full mb-5 sm:mb-6 space-y-3">
      {/* Main: Lost & Found | Adoption */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "lostFound", label: "Lost & Found" },
          { key: "adoption", label: "Adoption" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setMainType(item.key);
              setPetSub("all");
            }}
            className={`
              shrink-0 whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-full
              text-xs sm:text-sm font-semibold transition-all
              ${
                mainType === item.key
                  ? "bg-[#1F2E46] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Sub: All | Dog | Cat */}
      <div className="flex gap-2 flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <p className="w-full text-[11px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
          {mainType === "lostFound" ? "Lost & Found" : "Adoption"} · Pet type
        </p>
        {[
          { key: "all", label: "All" },
          { key: "dog", label: "Dog" },
          { key: "cat", label: "Cat" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPetSub(item.key)}
            className={`
              shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full
              text-xs sm:text-sm font-medium transition-all
              ${
                petSub === item.key
                  ? "bg-[#1F2E46] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

    {/* ================= LOADING ================= */}
    {loading ? (
      <p className="text-gray-500 py-10 sm:py-12 text-center text-sm sm:text-base">
        Loading posts...
      </p>
    ) : error ? (
      /* ================= ERROR ================= */
      <div className="py-10 sm:py-12 text-center px-4">
        <p className="text-red-600 mb-2 text-sm sm:text-base">
          {error}
        </p>

        <button
          onClick={() => {
            setError(null);
            setLoading(true);

            fetchHopePosts(params)
              .then((data) =>
                setPosts(
                  Array.isArray(data) ? data : []
                )
              )
              .catch(() =>
                setError(
                  "Failed to load posts. Please try again later."
                )
              )
              .finally(() => setLoading(false));
          }}
          className="
            text-[#1F2E46]
            font-semibold
            hover:underline
            text-sm
            sm:text-base
          "
        >
          Retry
        </button>
      </div>
    ) : posts.length === 0 ? (
      /* ================= EMPTY ================= */
      <div className="py-10 sm:py-12 text-center px-4">
        <p className="text-gray-500 mb-2 text-sm sm:text-base">
          No Hope posts found.
        </p>

        <p className="text-xs sm:text-sm text-gray-400 leading-5 max-w-md mx-auto">
          {location || searchQuery || petSub !== "all"
            ? "Try adjusting filters or check back later."
            : "Be the first to add a Hope post via the Furrmaa mobile app."}
        </p>
      </div>
    ) : (
      /* ================= POSTS ================= */
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-3
          xl:grid-cols-4
          gap-2.5
          sm:gap-4
          md:gap-6
        "
      >
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/hope/${post._id}`}
            className="
              block
              bg-white
              border
              border-gray-100
              rounded-xl
              sm:rounded-2xl
              overflow-hidden
              active:scale-[0.98]
              hover:shadow-md
              transition
              min-w-0
            "
          >
            {/* IMAGE */}
            <div
              className="
                aspect-square
                bg-gray-100
                flex
                items-center
                justify-center
                text-2xl
                sm:text-5xl
                overflow-hidden
              "
            >
              {post.images && post.images[0] ? (
                <img
                  src={post.images[0]}
                  alt={post.petName || "Pet"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span>
                  {post.petType === "dog"
                    ? "🐕"
                    : post.petType === "cat"
                    ? "🐱"
                    : "🐾"}
                </span>
              )}
            </div>

            {/* DETAILS */}
            <div className="p-2.5 sm:p-4 min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-xs sm:text-base">
                {post.petName || "Pet"}
              </h3>

              <p className="text-[10px] sm:text-sm text-gray-500 truncate mt-0.5">
                {post.petAgeText || "Age not specified"}
              </p>

              <p className="text-[9px] sm:text-xs text-gray-400 truncate mt-1">
                {post.locationText || "Location not specified"}
              </p>

              <span className="inline-block mt-1.5 sm:mt-2 text-[8px] sm:text-xs font-bold text-[#1F2E46]">
                {post.postType === "lostFound"
                  ? "Lost & Found"
                  : "Adoption"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    )}
  </Container>
</section>

      {/* ================= WHY CHOOSE ================= */}
      <WhyChooseFurrmaa />
    </div>
  );
}

export default function HopePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-gray-500">
          Loading...
        </div>
      }
    >
      <HopePageContent />
    </Suspense>
  );
}