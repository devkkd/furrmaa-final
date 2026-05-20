import React from 'react';
import Link from 'next/link';
import {
  FaPhoneAlt,
  FaArrowUp,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="w-full">
      {/* Top Banner: Dark Navy */}
      <div className="bg-[#1F2E46] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium">Our Experts are Available 24/7</span>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-xs" />
              <span className="text-sm font-semibold tracking-wide">+91-1234567890</span>
            </div>

            <div className="flex items-center gap-2">
              <BsStars className="text-white" />
              <span className="text-sm font-semibold">Furrmaa Pet AI Chat</span>
              <span className="bg-[#a3e635] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Premium
              </span>
            </div>
          </div>

          <button className="bg-white text-black px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-gray-100 transition-colors">
            Back to Top <FaArrowUp className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Links Area: Soft Blue Gradient */}
      <div className=" bg-[linear-gradient(180deg,#F3F8FF_0%,#C0DBFF_100%)] pt-16 lg:pt-24 pb-12">
        {/* CHANGED: lg:grid-cols-7 to lg:grid-cols-8 */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-4 lg:gap-x-6 gap-y-12">

          {/* Brand Column (Takes 2 of the 8 columns) */}
          <div className="col-span-2 lg:col-span-2 space-y-6 pr-0 lg:pr-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14  flex items-center justify-center">
                <img src="/images/MainLogo.png" alt="Furrmaa" className="w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[#0E0E0E] tracking-tight">FURRMAA</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  WHERE EVERY TAIL FEELS AT HOME
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-extrabold text-[#0E0E0E] text-[16px] leading-tight">
                Trusted Care for Every Stage of Your Pet’s Life
              </h4>
              <p className="text-gray-600 text-[13px] leading-relaxed">
                Furrmaa is not just an app—it's a complete pet-care ecosystem designed for modern pet parents. From daily needs to healthcare, Furrmaa brings everything together in one intuitive experience.
              </p>
            </div>
          </div>

          {/* 6 Link Columns (Take 1 column each: 6 x 1 = 6 columns) */}
          {/* Total = 2 (Brand) + 6 (Links) = 8 Columns */}
          <FooterCol title="Quick Links" items={[
            { label: "All For You", href: "/shop" },
            { label: "Food", href: "/shop" },
            { label: "Medicine", href: "/shop" },
            { label: "Toys", href: "/shop" },
            { label: "Accessories", href: "/shop" },
            { label: "Grooming", href: "/shop" },
            { label: "Supplements", href: "/shop" }
          ]} />

          <FooterCol title="Train" items={[
            { label: "Basic Training", href: "/training" },
            { label: "Intermediate Training", href: "/training" },
            { label: "Advanced Training", href: "/training" }
          ]} />

          <FooterCol title="Vet Services" items={[
            { label: "Veterinarians", href: "/vet" },
            { label: "Pet Shops", href: "/vet" },
            { label: "Hospitals", href: "/vet" },
            { label: "Pet Hotels / Hostels", href: "/vet" },
            { label: "NGOs", href: "/vet" },
            { label: "Shelters", href: "/vet" },
            { label: "Rescue Centers", href: "/vet" },
            { label: "Pet Cremation", href: "/vet" }
          ]} />

          <FooterCol title="Hope" items={[
            { label: "Lost & Found", href: "/hope?filter=lostFound" },
            { label: "Adoption", href: "/hope?filter=adoption" },
            { label: "Browse Posts", href: "/hope" },
          ]} />

          <FooterCol title="More" items={[
            "Furrmaa Pet AI Chat",
            { label: "Pet Events", href: "/events" },
            { label: "Pet Cremation", href: "/cremation" },
            { label: "About Us", href: "/about" },
            { label: "FAQ's", href: "/faqs" },
            { label: "Contact Us", href: "/contactus" },
          ]} />

          <FooterCol title="Account" items={[
            { label: "Login/Register", href: "/login" },
            { label: "Admin Login", href: "/admin/login" },
            "Cart",
            "My Orders",
            "Track Orders",
          ]} />
        </div>

        {/* Divider Info Bar: Blue Tint */}
        <div className="max-w-7xl mx-auto px-6 mt-12 text-[13px] lg:mt-5 pt-6 lg:pt-2 border-t border-[#B8D4F7] grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0">

          <div className="py-4 md:border-r border-[#B8D4F7]">
            <p className="font-semibold text-gray-900">Address</p>
            <p className="text-gray-500">100, ABCD Street, Jaipur, Rajasthan - INDIA</p>
          </div>

          <div className="py-4 md:border-r border-[#B8D4F7]">
            <p className="font-semibold text-gray-900">Call</p>
            <p className="text-gray-500">+91-1234567890</p>
          </div>

          <div className="py-4 md:border-r border-[#B8D4F7]">
            <p className="font-semibold text-gray-900">Email</p>
            <p className="text-gray-500">Support@furrmaa.in</p>
          </div>

          <div className="py-4">
            <p className="font-semibold text-gray-900">Legal</p>
            <p className="text-gray-500">Terms of Services | Privacy Policy</p>
          </div>

        </div>

        {/* Social and Credits */}
        <div className="max-w-7xl mx-auto px-6 mt-6 md:mt-5 pt-6 md:pt-2 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#B8D4F7]">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="font-bold text-gray-900 text-sm">Follow us</span>

            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]">
              <img src="/images/instaLogo.png" alt="Instagram" className="w-5 h-5 object-contain" />
            </div>

            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1877f2]">
              <img src="/images/FBlogo.png" alt="Facebook" className="w-5 h-5 object-contain" />
            </div>

            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff0000]">
              <img src="/images/YTlogo.png" alt="YouTube" className="w-5 h-5 object-contain" />
            </div>

            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0a66c2]">
              <img src="/images/LinkedInLogo.png" alt="LinkedIn" className="w-5 h-5 object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[12px]">
              Crafted by <strong className="text-gray-900 font-bold">Kontent Kraft Digital</strong>
            </span>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="max-w-7xl mx-auto px-6 mt-16 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left space-y-2">
            <p className="text-[11px] text-gray-900 font-semibold uppercase tracking-widest">Made With Gentle Care in Jaipur, India</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0E0E0E] flex items-center gap-3 justify-center lg:justify-start">
              Because Your Pet Deserves the Very Best 🐾
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Download Our App</span>
            <div className="flex gap-4">
              <AppButton icon={<FaApple />} store="App Store" />
              <AppButton icon={<FaGooglePlay />} store="Google Play" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <h4 className="font-bold text-[#0E0E0E] text-[13px] uppercase tracking-wide">{title}</h4>
      <ul className="space-y-3 lg:space-y-4 text-gray-600 text-[13px] font-medium">
        {items.map((item, i) => {
          const isLink = typeof item === 'object' && item.href;
          return (
            <li key={i} className="leading-tight">
              {isLink ? (
                <Link href={item.href} className="hover:text-black transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="hover:text-black cursor-pointer transition-colors">{item}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Info({ title, text, isLast = false }) {
  return (
    <div className={`md:px-6 h-full flex flex-col justify-center text-center md:text-left ${!isLast ? 'md:border-r border-[#B8D4F7]' : ''}`}>
      <h4 className="font-bold text-gray-500 text-[10px] uppercase tracking-widest mb-1 md:mb-2">{title}</h4>
      <p className="text-gray-900 font-bold text-[13px] lg:text-[14px] leading-tight">{text}</p>
    </div>
  );
}

function AppButton({ icon, store }) {
  return (
    <button className="flex items-center justify-center gap-3 bg-black text-white px-5 py-3 rounded-2xl hover:bg-gray-900 transition-all shadow-xl active:scale-95 min-w-[150px] lg:min-w-[170px]">
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <p className="text-[9px] uppercase font-bold leading-none opacity-60 mb-1">Download on the</p>
        <p className="text-[14px] lg:text-[15px] font-bold leading-none">{store}</p>
      </div>
    </button>
  );
}