import React from "react";
import Link from "next/link";

export default function PetCard() {
  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Pet Training</h2>
          <p className="text-gray-900 text-lg mt-1">
            Start where your pet feels comfortable
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card (Orange) - Now a clickable Link */}
          <Link
            href="/training"
            className="lg:col-span-2 bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
          >

            {/* Left Content Side */}
            <div className="flex-1 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">Basic Training</h3>
                  <span className="text-xs bg-white px-3 py-1 rounded-full font-medium shadow-sm">
                    Free
                  </span>
                </div>

                <p className="text-base text-gray-800 leading-relaxed w-50">
                  Foundation skills, simple commands, bonding.
                </p>

                <div className="flex flex-wrap gap-2 pt-2 w-50">
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-full border text-black/80 border-black/80">7 Lessons</span>
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-full border text-black/80 border-black/80">7 Days</span>
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-full border text-black/80 border-black/80">
                    7 Great Ways to Training
                  </span>
                </div>
              </div>

              {/* Call to Action + Puppy Layout */}
              <div className="flex items-center justify-between md:justify-start gap-4 mt-8 md:mt-0">
                {/* Changed from button to div for valid HTML nesting inside Link, added group-hover */}
                <div className="text-2xl font-bold text-gray-900 group-hover:translate-x-2 transition-transform duration-300">
                  Let’s Start →
                </div>
                {/* Puppy image - Positioned relative to this flex container on mobile */}
                <img
                  src="/images/CardTwo/p1.png"
                  alt="puppy"
                  className="w-40 h-auto md:absolute md:bottom-4 md:left-[25%] lg:left-[28%]"
                />
              </div>
            </div>

            {/* Right Video Side */}
            <div className="flex-1">
              <div className="relative group/video">
                <img
                  src="/images/CardTwo/p2.png"
                  alt="training video"
                  className="rounded-2xl w-full aspect-video md:aspect-square lg:aspect-video object-cover shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                  <p className="font-bold text-gray-900">(Video Title)</p>
                  <p className="text-gray-700 text-xs">1 Lesson | 1 Day | 4:56 Min</p>
                </div>

                {/* Changed from button to div for valid HTML nesting inside Link */}
                <div className="bg-[#1F2E46] group-hover:bg-[#2a3c5a] text-white text-sm font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors">
                  <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="border-l-4 border-l-[#1F2E46] border-y-[3px] border-y-transparent ml-0.5" />
                  </span>
                  Play
                </div>
              </div>
            </div>
          </Link>

          {/* Side Card (Blue) */}
<div className="bg-gradient-to-b from-[#F3F8FF] to-[#C0DBFF] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[300px]">            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                Hire a Personal Pet Trainer
              </h3>
              <p className="text-sm text-gray-700 mt-4 leading-relaxed w-40 md:w-60">
                Personalized, one-on-one training in your home. Positive
                methods. Real results.
              </p>
            </div>

            <div className="flex items-end justify-between mt-6">
              <button className="bg-[#1F2E46] hover:bg-black text-white text-sm font-bold px-5 py-3 rounded-full transition-all z-10">
                Book Session Today →
              </button>

              <img
                src="/images/CardTwo/p3.png"
                alt="trainer"
                className="absolute bottom-0 right-0 w-44 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}