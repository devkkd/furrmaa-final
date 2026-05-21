"use client";

import React, { useState, useEffect } from "react";
import { fetchAllCategories, fetchSizes, fetchDietary } from "@/lib/api";

/* =========================
   FILTER CONFIG (Static filters)
========================= */
const STATIC_FILTER_GROUPS = [
  {
    id: "petType",
    title: "Pet Type",
    options: ["Dog", "Cat"],
  },
  {
    id: "age",
    title: "Age",
    options: ["Puppy", "Young", "Adult", "Senior"],
  },
  {
    id: "dogBreed",
    title: "Dog Breed",
    options: [
      "Labrador",
      "Golden Retriever",
      "German Shepherd",
      "Poodle",
      "French Bulldog",
    ],
  },
  {
    id: "catBreed",
    title: "Cat Breed",
    options: [
      "Persian",
      "Maine Coon",
      "Bengal",
      "Ragdoll",
      "Siamese",
    ],
  },
  {
    id: "size",
    title: "Size",
    options: [], // filled from API below
  },
  {
    id: "dietary",
    title: "Dietary Needs",
    options: [], // filled from API below
  },
  {
    id: "rating",
    title: "Rating",
    options: ["4★ & up", "3★ & up", "2★ & up", "1★ & up"],
  },
];

const INITIAL_STATE = {
  petType: [],
  category: [],
  age: [],
  dogBreed: [],
  catBreed: [],
  size: [],
  dietary: [],
  rating: [],
};

export default function FilterSidebar({ filters, onChange }) {
  const [selectedFilters, setSelectedFilters] = useState(INITIAL_STATE);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dietary, setDietary] = useState([]);

  // Fetch categories from API (name for display, slug for filter value)
  useEffect(() => {
    let cancelled = false;
    fetchAllCategories()
      .then((data) => {
        if (!cancelled) {
          const list = (data || [])
            .filter((cat) => cat && (cat.slug || cat.name || cat.title))
            .map((cat) => ({
              value: cat.slug || (cat.name || cat.title || "").toLowerCase().replace(/\s+/g, "-"),
              label: cat.name || cat.title || cat.slug || "",
            }));
          setCategories(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([
            { value: "food", label: "Food" },
            { value: "toys", label: "Toys" },
            { value: "accessories", label: "Accessories" },
            { value: "grooming", label: "Grooming" },
            { value: "health", label: "Health" },
            { value: "bedding", label: "Bedding" },
            { value: "other", label: "Other" },
          ]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch sizes and dietary from API
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchSizes(), fetchDietary()])
      .then(([sizesData, dietaryData]) => {
        if (cancelled) return;
        setSizes(
          (sizesData || []).map((s) => ({
            value: s.slug || s.name?.toLowerCase().replace(/\s+/g, "-"),
            label: s.name || s.slug || "",
          }))
        );
        setDietary(
          (dietaryData || []).map((d) => ({
            value: d.slug || d.name?.toLowerCase().replace(/\s+/g, "-"),
            label: d.name || d.slug || "",
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSizes([
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "extra-large", label: "Extra Large" },
          ]);
          setDietary([
            { value: "grain-free", label: "Grain-Free" },
            { value: "high-protein", label: "High-Protein" },
            { value: "weight-control", label: "Weight Control" },
            { value: "hypoallergenic", label: "Hypoallergenic" },
          ]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Build filter groups with dynamic categories, sizes, dietary (options are { value, label })
  const FILTER_GROUPS = [
    ...STATIC_FILTER_GROUPS.slice(0, 1), // petType
    {
      id: "category",
      title: "Category",
      options: categories.length > 0 ? categories : [
        { value: "food", label: "Food" },
        { value: "toys", label: "Toys" },
        { value: "accessories", label: "Accessories" },
        { value: "grooming", label: "Grooming" },
        { value: "health", label: "Health" },
        { value: "bedding", label: "Bedding" },
        { value: "other", label: "Other" },
      ],
    },
    ...STATIC_FILTER_GROUPS.slice(1, 4), // age, dogBreed, catBreed
    {
      id: "size",
      title: "Size",
      options: sizes.length > 0 ? sizes : [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "extra-large", label: "Extra Large" },
      ],
    },
    {
      id: "dietary",
      title: "Dietary Needs",
      options: dietary.length > 0 ? dietary : [
        { value: "grain-free", label: "Grain-Free" },
        { value: "high-protein", label: "High-Protein" },
        { value: "weight-control", label: "Weight Control" },
        { value: "hypoallergenic", label: "Hypoallergenic" },
      ],
    },
    ...STATIC_FILTER_GROUPS.slice(6), // rating only (4=size, 5=dietary already added above)
  ];

  /* =========================
     URL → SIDEBAR SYNC
  ========================= */
  useEffect(() => {
    if (!filters) return;

    const normalize = (val) =>
      val.split(",").map((v) => capitalize(v));

    setSelectedFilters({
      petType: filters.petType ? normalize(filters.petType) : [],
      category: filters.category ? filters.category.split(",").map((v) => v.trim().toLowerCase()) : [],
      age: filters.age ? normalize(filters.age) : [],
      dogBreed: filters.dogBreed
        ? filters.dogBreed.split(",").map(capitalize)
        : [],
      catBreed: filters.catBreed
        ? filters.catBreed.split(",").map(capitalize)
        : [],
      size: filters.size ? filters.size.split(",").map((v) => v.trim().toLowerCase()) : [],
      dietary: filters.dietary ? filters.dietary.split(",").map((v) => v.trim().toLowerCase()) : [],
      rating: filters.rating
        ? filters.rating.split(",").map((r) => `${r}★ & up`)
        : [],
    });
  }, [filters]);

  /* =========================
     TOGGLE HANDLER
  ========================= */
  const handleToggle = (groupId, optionValue) => {
    const prev = selectedFilters;
    const current = prev[groupId] || [];
    const isSelected = current.some(
      (v) => String(v).toLowerCase() === String(optionValue).toLowerCase()
    );

    // All filters = multi-select: toggle on/off
    const updatedGroup = isSelected
      ? current.filter((v) => String(v).toLowerCase() !== String(optionValue).toLowerCase())
      : [...current, typeof optionValue === "string" ? optionValue : String(optionValue)];

    const newState = { ...prev, [groupId]: updatedGroup };

    if (groupId === "petType") {
      if (!updatedGroup.some((v) => String(v).toLowerCase() === "dog")) newState.dogBreed = [];
      if (!updatedGroup.some((v) => String(v).toLowerCase() === "cat")) newState.catBreed = [];
    }

    setSelectedFilters(newState);

    const payload = {};
    Object.entries(newState).forEach(([key, value]) => {
      const arr = value || [];
      if (!arr.length) payload[key] = null;
      else if (key === "rating")
        payload[key] = arr.map((v) => (typeof v === "string" ? v.charAt(0) : v)).join(",");
      else if (key === "category")
        payload[key] = arr.join(",");
      else payload[key] = arr.map((v) => (typeof v === "string" ? v.toLowerCase() : v)).join(",");
    });
    onChange(payload);
  };

  /* =========================
     CLEAR ALL
  ========================= */
  const clearAll = () => {
    setSelectedFilters(INITIAL_STATE);
    onChange(
      Object.keys(INITIAL_STATE).reduce((acc, k) => {
        acc[k] = null;
        return acc;
      }, {})
    );
  };

  const petTypes = selectedFilters.petType;
  const showDogBreed = petTypes.includes("Dog");
  const showCatBreed = petTypes.includes("Cat");

  return (
    <aside className="w-full max-w-[280px] bg-white border border-[#D9DCE2] rounded-2xl flex flex-col text-black">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#D9DCE2]">
        <h2 className="font-semibold text-lg">Filters</h2>
        <button
          onClick={clearAll}
          className="text-sm text-gray-500 hover:text-black transition"
        >
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="flex-1">
        {FILTER_GROUPS.map((group) => {
          if (group.id === "dogBreed" && !showDogBreed) return null;
          if (group.id === "catBreed" && !showCatBreed) return null;

          return (
            <div
              key={group.id}
              className="px-5 py-4 border-b border-[#D9DCE2]"
            >
              <h3 className="text-[11px] font-semibold uppercase text-gray-600 mb-3 tracking-wide">
                {group.title}
              </h3>

              <div className="flex flex-col gap-3">
                {group.options.map((option) => {
                  const value = typeof option === "object" && option !== null && "value" in option ? option.value : option;
                  const label = typeof option === "object" && option !== null && "label" in option ? option.label : option;
                  const selected = selectedFilters[group.id] || [];
                  const checked = selected.some((v) => String(v).toLowerCase() === String(value).toLowerCase());

                  return (
                    <label
                      key={String(value)}
                      className="flex items-center gap-3 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggle(group.id, value)}
                        className="
                          h-5 w-5
                          rounded-md
                          border border-[#D9DCE2]
                          accent-[#1F2E46]
                          cursor-pointer
                        "
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* =========================
   HELPER
========================= */
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);
