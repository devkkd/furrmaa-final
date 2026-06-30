import React from 'react';
import Link from 'next/link';
import {
  FaPhoneAlt,
  FaArrowUp,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="w-full">
      {/* Top Banner: Dark Navy */}
      <div className="bg-[#1F2E46] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium">Our Experts are Available 24/7</span>

          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-xs" />
              <span className="text-sm font-semibold tracking-wide">+91-1234567890</span>
            </div>

            <div className="flex items-center gap-2">
              <BsStars className="text-white" />
              <span className="text-sm font-semibold">Furrmaa Pet AI Chat</span>
              <span className="bg-[#a3e635] text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                Premium
              </span>
            </div>
          </div>

          <button className="bg-white text-black px-6 py-4 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-gray-100 transition-colors">
            Back to Top <FaArrowUp className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Links Area: Soft Blue Gradient */}
      <div className="bg-[linear-gradient(180deg,#F3F8FF_0%,#C0DBFF_100%)] pt-16 lg:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-4 lg:gap-x-6 gap-y-12">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 space-y-6 pr-0 lg:pr-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center">
                <img src="/images/MainLogo.png" alt="Furrmaa" className="w-20" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0E0E0E] tracking-tight">FURRMAA</h2>
                <p className="text-[10px] text-gray-700 font-semibold uppercase">
                  WHERE EVERY TAIL FEELS AT HOME
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-extrabold text-[#0E0E0E] text-[14px] leading-tight">
                Trusted Care for Every Stage of Your Pet&apos;s Life
              </h4>
              <p className="text-gray-900 text-[13px] leading-relaxed">
                Furrmaa is not just an app—it&apos;s a complete pet-care ecosystem designed for modern pet parents. From daily needs to healthcare, Furrmaa brings everything together in one intuitive experience.
              </p>
            </div>
          </div>

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

        {/* Divider Info Bar */}
        <div className="max-w-full border-t border-[#0E0E0E] px-6 mt-6 md:mt-5 pt-6 md:pt-4">
          <div className="max-w-7xl mx-auto px-6 text-[13px] grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0">

            <div className="py-4 md:border-r border-[#0E0E0E]">
              <p className="font-semibold text-gray-900">Address</p>
              <p className="text-gray-700">100, ABCD Street, Jaipur, Rajasthan - INDIA</p>
            </div>

            <div className="py-4 md:border-r border-[#0E0E0E] justify-center grid">
              <p className="font-semibold text-gray-900">Call</p>
              <p className="text-gray-700">+91-1234567890</p>
            </div>

            <div className="py-4 md:border-r border-[#0E0E0E] justify-center grid">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-700">Support@furrmaa.in</p>
            </div>

            <div className="py-4 justify-center grid">
              <p className="font-semibold text-gray-900">Legal</p>
              <p className="text-gray-700">Terms of Services | Privacy Policy</p>
            </div>

          </div>
        </div>

        {/* Social and Credits */}
        <div className="max-w-full border-t border-b pb-6 border-[#0E0E0E] px-6 mt-6 md:mt-5 pt-6 md:pt-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
              <span className="font-bold text-gray-900 text-sm">Follow us</span>

              <a href="#" className="flex items-center gap-1 group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/icons/insta-logo.png" alt="Instagram" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-[12px] text-gray-600 group-hover:text-black transition-colors font-medium">@Furrmaa</span>
              </a>

              <a href="#" className="flex items-center gap-1 group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/icons/facebook-logo.png" alt="Facebook" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-[12px] text-gray-600 group-hover:text-black transition-colors font-medium">@Furrmaa</span>
              </a>

              <a href="#" className="flex items-center gap-1 group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/icons/youtube-logo.png" alt="YouTube" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-[12px] text-gray-600 group-hover:text-black transition-colors font-medium">@Furrmaa</span>
              </a>

              <a href="#" className="flex items-center gap-1 group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/icons/linkdin-logo.png" alt="LinkedIn" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-[12px] text-gray-600 group-hover:text-black transition-colors font-medium">@Furrmaa</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span>
                <img src="/images/icons/Vector.png" className="w-4 h-6" alt="" />
              </span>
              <span className="text-gray-500 text-[12px]">
                Crafted by <strong className="text-gray-900 font-bold">
                  <Link href="https://www.kontentkraftdigital.com/" target="_blank">Kontent Kraft Digital</Link>
                </strong>
              </span>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="max-w-7xl mx-auto px-6 mt-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left space-y-2">
            <p className="text-[11px] text-gray-900 font-semibold uppercase tracking-widest">Made With Gentle Care in Jaipur, India</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0E0E0E] flex items-center gap-3 justify-center lg:justify-start">
              Because Your Pet Deserves the Very Best 🐾
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-xs font-bold text-gray-900">Download Our App</span>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                <img src="/images/buttons/apple-button.png" className="w-32" alt="App Store" />
              </button>
              <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                <img src="/images/buttons/play-button.png" className="w-34" alt="Google Play" />
              </button>
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
