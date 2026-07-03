import React from "react";

export default function AboutFurrmaa() {
  return (
   <section className="w-full bg-[#F8FAFC] py-8 md:py-24">
     <div className="max-w-7xl mx-auto px-5 md:px-8">

        {/* ── TOP LABEL ── */}
       <p className="text-xs md:text-md font-semibold uppercase tracking-widest text-gray-800 mb-2 md:mb-3">
          Our Story
        </p>

        {/* ── HEADLINE ── */}
        <h2 className="text-[20px] md:text-4xl font-bold text-black leading-tight mb-5 md:mb-12 max-w-2xl">
          Every great company begins
          <br className="hidden md:block" /> with a reason.
        </h2>

        {/* ── MAIN CONTENT: 2 columns ── */}
       <div className="flex flex-col md:flex-row items-start gap-4 md:gap-16">

          {/* LEFT — Story text */}
          <div className="w-full md:w-1/2 space-y-3 md:space-y-5 text-gray-600 text-[12px] md:text-[15px] leading-5 md:leading-relaxed">

            <p>
              Ours began with two experiences that changed everything. A dear friend's German Shepherd,{" "}
              <span className="font-semibold text-gray-900">Charlie</span>, who became family — and tragically passed away after adoption. Then another friend lost his dog due to incorrect medical treatment.
            </p>

            <p>
              Those moments made one thing clear: the pet care ecosystem lacked{" "}
              <span className="font-semibold text-gray-900">trust, transparency, and standardization.</span>
            </p>

            <p>
              That realization became the foundation of{" "}
              <span className="font-semibold text-gray-900">Furrmaa</span> — India's trusted pet care ecosystem, bringing together verified services, quality products, and AI-powered guidance.
            </p>

            <p className="italic text-gray-500">
              Because every pet deserves the best care, and every pet parent deserves someone they can trust.
            </p>

            {/* Founder signature */}
            <div className="pt-3 md:pt-4 border-t border-gray-200">
              <p className="font-bold text-gray-900 text-[14px] md:text-[15px]">Sanidhya Sharma</p>
              <p className="text-sm text-gray-400">Founder &amp; CEO, Furrmaa</p>
            </div>
          </div>

          {/* RIGHT — Images */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">

            {/* Hero image */}
            <img
              src="/images/Founder.png"
              alt="Sanidhya Sharma — Founder of Furrmaa"
              className="w-full h-[180px] md:h-[400px] object-cover object-top rounded-[18px] md:rounded-3xl"
            />

            {/* 3 small supporting images */}
            {/* <div className="grid grid-cols-3 gap-3">
              <img
                src="/images/AboutFurrmaa/about2.png"
                alt="Pet care moment"
                className="w-full h-[110px] object-cover rounded-2xl"
              />
              <img
                src="/images/AboutFurrmaa/about3.png"
                alt="Pet care moment"
                className="w-full h-[110px] object-cover rounded-2xl"
              />
              <img
                src="/images/AboutFurrmaa/about4.png"
                alt="Pet care moment"
                className="w-full h-[110px] object-cover rounded-2xl"
              />
            </div> */}
          </div>

        </div>

        {/* ── BOTTOM STATS BAR ── */}
       <div className="mt-5 md:mt-16 border-t border-gray-200 pt-4 md:pt-10 grid grid-cols-4 gap-1 md:gap-8">
          {[
            { value: "10K+",  label: "Pet Parents Served" },
            { value: "500+",  label: "Verified Service Providers" },
            { value: "50+",   label: "Cities Across India" },
            { value: "4.9★",  label: "Average App Rating" },
          ].map((stat) => (
            <div
  key={stat.label}
  className="text-center md:text-left"
>
              <p className="text-[15px] md:text-3xl font-extrabold text-black">{stat.value}</p>
              <p className="text-[8px] md:text-sm text-gray-600 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
