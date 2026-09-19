"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/Container";
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiPhone,
} from "react-icons/hi";
import { RiDirectionLine } from "react-icons/ri";
import { LuArrowUpDown } from "react-icons/lu";
import Link from "next/link";
import { fetchCremationCenters } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPickerModal from "@/components/LocationPickerModal";
import LogoLoader from "@/components/LogoLoader";

const CremationServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showLocationModal, setShowLocationModal] = useState(false);

  const {
    location,
    loading: locLoading,
    error: locError,
    fetchCurrentLocation,
    setLocation,
  } = useGeolocation("Pratap Nagar, Jaipur");

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

  useEffect(() => {
    setLoading(true);

    fetchCremationCenters({
      location: location?.trim() || undefined,
      search: search.trim() || undefined,
    })
      .then((centers) => {
        const mapped = (centers || []).map((c) => ({
          _id: c._id,
          name: c.name,
          address: c.address,
          city: c.city,
          state: c.state,
          phone: c.phone,
          image: c.image || "/images/Events/events.png",
          distance: c.distance || `${c.city}, ${c.state}`,
        }));

        const sorted = [...mapped].sort((a, b) => {
          if (sortBy === "city") {
            return String(a.city || "").localeCompare(
              String(b.city || "")
            );
          }

          return String(a.name || "").localeCompare(
            String(b.name || "")
          );
        });

        setServices(sorted);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [location, search, sortBy]);

  return (
    <section className="bg-white py-6 sm:py-8 md:py-10 px-4 sm:px-5 md:px-0 min-h-screen overflow-x-hidden">
      <Container>
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start lg:items-center justify-between mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Cremation
          </h1>

          {/* ================= CONTROLS ================= */}
          <div className="w-full lg:w-auto">
            {/* SEARCH */}
            <div className="relative w-full lg:w-80">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />

              <input
                type="text"
                placeholder="Search Cremation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  h-11
                  sm:h-12
                  pl-10
                  pr-4
                  border
                  border-gray-100
                  rounded-xl
                  bg-gray-50/50
                  focus:outline-none
                  focus:ring-1
                  focus:ring-gray-200
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                  transition-all
                "
              />
            </div>

            {/* SORT + LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-stretch gap-2.5 sm:gap-3 mt-3">
              {/* SORT */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border
                  border-gray-100
                  rounded-xl
                  px-3
                  sm:px-4
                  h-11
                  sm:h-12
                  text-sm
                  text-gray-600
                  bg-white
                  hover:bg-gray-50
                  transition
                  font-medium
                  min-w-0
                "
              >
                <LuArrowUpDown className="text-gray-400 shrink-0" />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="
                    bg-transparent
                    focus:outline-none
                    text-sm
                    w-full
                    min-w-0
                    cursor-pointer
                  "
                >
                  <option value="name">Sort: Name</option>
                  <option value="city">Sort: City</option>
                </select>
              </div>

              {/* LOCATION */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border
                  border-gray-100
                  rounded-xl
                  px-3
                  h-11
                  sm:h-12
                  bg-white
                  shadow-sm
                  min-w-0
                "
              >
                <HiOutlineLocationMarker className="text-gray-400 text-lg shrink-0" />

                <span className="text-xs text-gray-600 font-bold truncate flex-1 min-w-0">
                  {locLoading
                    ? "Getting location..."
                    : location || "Select location"}
                </span>

                <button
                  onClick={() => setShowLocationModal(true)}
                  disabled={locLoading}
                  className="
                    bg-[#a3e635]
                    text-white
                    text-[9px]
                    sm:text-[10px]
                    font-extrabold
                    px-2.5
                    sm:px-3
                    py-1.5
                    rounded-lg
                    uppercase
                    hover:opacity-90
                    transition
                    shadow-sm
                    shrink-0
                    disabled:opacity-60
                  "
                >
                  Change
                </button>
              </div>
            </div>
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

        {/* ================= SERVICES ================= */}
        {loading ? (
          <LogoLoader />
        ) : services.length === 0 ? (
          <div className="py-10 sm:py-14 text-center text-gray-500 text-sm sm:text-base px-4">
            No cremation centers found for selected location.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="
                  flex
                  flex-row
                  gap-3
                  sm:gap-4
                  md:gap-5
                  p-3
                  sm:p-4
                  md:p-5
                  bg-white
                  border
                  border-gray-100
                  rounded-[18px]
                  sm:rounded-[22px]
                  md:rounded-[28px]
                  transition-all
                  hover:shadow-md
                  group
                  min-w-0
                "
              >
                {/* IMAGE */}
                <div
                  className="
                    w-24
                    h-24
                    xs:w-28
                    xs:h-28
                    sm:w-32
                    sm:h-32
                    md:w-40
                    md:h-40
                    shrink-0
                    rounded-[14px]
                    sm:rounded-[16px]
                    md:rounded-[20px]
                    overflow-hidden
                    bg-gray-100
                    shadow-sm
                  "
                >
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900 leading-tight mb-1 truncate">
                      {service.name}
                    </h3>

                    <div className="flex items-center gap-1 text-gray-400 text-[9px] sm:text-[10px] md:text-xs mb-1.5 md:mb-2 font-bold uppercase tracking-wider min-w-0">
                      <HiOutlineLocationMarker className="text-xs md:text-sm shrink-0" />

                      <span className="truncate">
                        {service.distance}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] md:text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
                      {service.address}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2 mt-auto">
                    {/* CALL */}
                    <a
                      href={
                        service.phone
                          ? `tel:${service.phone}`
                          : undefined
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-1
                        sm:gap-2
                        bg-[#8b5cf6]
                        text-white
                        px-2.5
                        sm:px-4
                        md:px-5
                        py-1.5
                        sm:py-2
                        md:py-2.5
                        rounded-full
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-bold
                        hover:bg-[#7c3aed]
                        transition-colors
                        shadow-sm
                        shrink-0
                      "
                    >
                      <HiPhone className="text-[10px] sm:text-xs md:text-sm" />

                      <span className="hidden sm:inline">
                        Call
                      </span>
                    </a>

                    {/* DIRECTION */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${service.name}, ${service.address || ""}, ${service.city || ""}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex
                        items-center
                        gap-1
                        sm:gap-2
                        text-gray-600
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-bold
                        hover:text-gray-900
                        transition-colors
                        shrink-0
                      "
                    >
                      <RiDirectionLine className="text-sm md:text-lg" />

                      <span className="hidden sm:inline">
                        Direction
                      </span>
                    </a>

                    {/* REQUEST */}
                    <Link
                      href={`/cremation/reqCremation/${service._id}`}
                      className="ml-auto max-w-full"
                    >
                      <button
                        className="
                          bg-[#1e293b]
                          text-white
                          px-2.5
                          sm:px-4
                          md:px-5
                          py-1.5
                          sm:py-2
                          md:py-2.5
                          rounded-full
                          text-[9px]
                          sm:text-[10px]
                          lg:text-xs
                          font-bold
                          hover:bg-black
                          transition-colors
                          shadow-sm
                          whitespace-nowrap
                        "
                      >
                        Request
                        <span className="hidden sm:inline">
                          {" "}
                          for Cremation
                        </span>{" "}
                        ➔
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default CremationServices;