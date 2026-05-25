"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaDownload,
  FaBars,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { usePetStore } from "@/store/petStore";

export default function Header() {
  const [open, setOpen] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.qty, 0)
  );

  const petType = usePetStore((s) => s.petType);

  const shopCat = (cat) =>
    `/shop?category=${cat}${petType ? `&petType=${petType}` : ""}`;

  // Centralized Navigation Links to keep code clean
  const navItems = [
    { label: "Shop", href: "/shop", icon: "/images/icons/shop.svg" },
    { label: "Food", href: shopCat("food"), icon: "/images/icons/food.svg" },
    { label: "Medicine", href: shopCat("medicine"), icon: "/images/icons/medicine.svg" },
    { label: "Toys", href: shopCat("toys"), icon: "/images/icons/toys.svg" },
    { label: "Accessories", href: shopCat("accessories"), icon: "/images/icons/Accessories.svg" },
    { label: "Grooming", href: shopCat("grooming"), icon: "/images/icons/Grooming.svg" },
    { label: "Supplements", href: shopCat("supplements"), icon: "/images/icons/Supplements.svg" },
    { label: "Pet Training", href: "/training", icon: "/images/icons/Pet Training.svg" },
    { label: "Near By", href: "/vet", icon: "/images/icons/vet services.svg" },
    { label: "Hope", href: "/hope", icon: "/images/icons/hope.svg" },
    { label: "Pet Events", href: "/events", icon: "/images/icons/pet events.svg" },
    { label: "Pet Social", href: "/social", fallbackIcon: <FaUsers className="w-4 h-4 text-gray-700" /> },
  ];

  return (
    <div className="relative z-20 text-[#1F2E46]">
      
      {/* HEADER */}
      <header className="w-full bg-white border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          
          <div className="flex items-center justify-between gap-4">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/images/MainLogo.png"
                alt="Furrmaa"
                className="w-10 h-10"
              />
              <div>
                <h1 className="font-bold text-lg text-slate-900">FURRMAA</h1>
                <p className="text-[10px] text-gray-500">
                  WHERE EVERY TAIL FEELS AT HOME
                </p>
              </div>
            </Link>

            {/* SEARCH (DESKTOP ONLY) */}
            <div className="hidden lg:flex items-center flex-1 max-w-xl bg-gray-50 border border-gray-300 rounded-xl px-4 py-2">
              <FaSearch className="text-gray-400 mr-2 text-sm" />
              <input
                type="text"
                placeholder="Search food, toys, meds & more..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-3">
              
              {/* AI CHAT */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm">
                <BsStars />
                <span>Ask Charlie</span>
                <span className="bg-lime-400 text-black text-xs px-2 py-0.5 rounded-xl">
                  Premium
                </span>
              </div>

              {/* LOGIN */}
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm"
                >
                  <FaUser />
                  Login/Register
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="flex items-center gap-2 bg-[#1F2E46] text-white border border-gray-300 rounded-xl px-4 py-2 text-sm"
                >
                  <FaUser />
                  {user.name}
                </Link>
              )}

              {/* CART */}
              <Link
                href="/cart"
                className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm"
              >
                <FaShoppingCart />
                Cart ({cartCount})
              </Link>

              {/* APP DOWNLOAD */}
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm">
                <FaDownload />
                Download App
              </button>
            </div>

            {/* MOBILE + TABLET ICONS */}
            <div className="flex lg:hidden items-center gap-4">
              
              <button className="text-xl hidden md:block">
                <FaSearch />
              </button>

              {!isAuthenticated ? (
                <Link href="/login" className="text-xl">
                  <FaUser />
                </Link>
              ) : (
                <Link href="/account" className="text-xl">
                  <FaUser />
                </Link>
              )}

              <Link href="/cart" className="relative text-xl">
                <FaShoppingCart />
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              </Link>

              <button className="text-xl" onClick={() => setOpen(!open)}>
                {open ? <FaTimes /> : <FaBars />}
              </button>
            </div>

          </div>

          {/* MOBILE SEARCH */}
          <div className="lg:hidden mt-3 flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-2">
            <FaSearch className="text-gray-400 mr-2 text-sm" />
            <input
              type="text"
              placeholder="Search food, toys, meds & more..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden absolute left-0 right-0 bg-white border-b border-gray-300 transition-all duration-300 overflow-hidden ${
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-6 space-y-6">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} className="flex items-center gap-4 text-sm font-medium">
              {item.icon ? (
                <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain" />
              ) : (
                item.fallbackIcon
              )}
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* DESKTOP NAV */}
      <nav className="w-full bg-white border-b border-gray-300 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-between py-3 text-sm text-gray-700">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="flex items-center gap-2 hover:text-[#1F2E46] transition-colors font-medium">
                  {item.icon ? (
                    <img src={item.icon} alt={item.label} className="w-4 h-4 object-contain" />
                  ) : (
                    item.fallbackIcon
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

    </div>
  );
}