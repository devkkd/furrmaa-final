'use client';

import React from 'react';
import Link from 'next/link';
import { usePetStore } from '@/store/petStore';

const CONTENT = {
  dog: {
    sectionTitle: 'Dog Training',
    sectionSub: 'Start where your dog feels comfortable',
    basicTitle: 'Basic Training',
    basicDesc: "Your best buddy's first step towards social obedience.",
    tags: ['Puppy', 'Dog', 'View More Details'],
    cta: "Let's Start →",
    heroImg: '/images/dog-1.1.png',
    videoImg: '/images/dog-2.png',
    trainerTitle: 'Hire a Personal Dog Trainer',
    trainerDesc:
      'Personalized, one-on-one training in your home. Positive methods. Real results.',
    trainerImg: '/images/dog2.3.png',
    bookCta: 'Book Session Today →',
  },
  cat: {
    sectionTitle: 'Cat Training',
    sectionSub: 'Start where your cat feels comfortable',
    basicTitle: 'Basic Cat Training',
    basicDesc:
      "Gentle habits, litter confidence, and bonding — made simple for cats.",
    tags: ['Kitten', 'Cat', 'View More Details'],
    cta: "Let's Start →",
    heroImg: '/images/cat-1.1.png',
    videoImg: '/images/cat-2.4.png',
    trainerTitle: 'Hire a Personal Cat Trainer',
    trainerDesc:
      'Calm, cat-friendly coaching at home. Build trust and better routines together.',
    trainerImg: '/images/cat-1.2.png',
    bookCta: 'Book Session Today →',
  },
};

export default function PetCard() {
  const petType = usePetStore((s) => s.petType) || 'dog';
  const c = CONTENT[petType === 'cat' ? 'cat' : 'dog'];

  return (
    <section className="w-full py-6 md:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-[22px] md:text-3xl font-bold text-gray-900">
            {c.sectionTitle}
          </h2>
          <p className="text-gray-900 text-sm md:text-lg mt-1">{c.sectionSub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Link
            href="/training"
            className="lg:col-span-2 bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80] rounded-[22px] md:rounded-3xl p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
          >
            <div className="flex-1 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    {c.basicTitle}
                  </h3>
                  <span className="text-xs bg-white px-3 py-1 rounded-full font-medium shadow-sm">
                    Free
                  </span>
                </div>

                <p className="text-sm md:text-base text-gray-800 leading-relaxed w-full md:w-50">
                  {c.basicDesc}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 w-full md:w-50">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] font-semibold px-3 py-1 rounded-full border text-black/80 border-black/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between md:justify-start gap-3 mt-5 md:mt-0">
                <div className="text-lg md:text-2xl font-bold text-gray-900 group-hover:translate-x-2 transition-transform duration-300">
                  {c.cta}
                </div>
                <img
                  src={c.heroImg}
                  alt={petType === 'cat' ? 'kitten' : 'puppy'}
                  className="w-24 md:w-40 h-auto object-contain md:absolute md:bottom-4 md:left-[25%] lg:left-[28%]"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="relative group/video">
                <img
                  src={c.videoImg}
                  alt="training"
                  className="rounded-xl md:rounded-2xl w-full aspect-video md:aspect-square lg:aspect-video object-cover shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                  <p className="font-bold text-gray-900">
                    {petType === 'cat' ? 'Cat Basics' : 'Dog Basics'}
                  </p>
                  <p className="text-gray-700 text-xs">1 Lesson | 1 Day | 4:56 Min</p>
                </div>

                <div className="bg-[#1F2E46] group-hover:bg-[#2a3c5a] text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-full flex items-center gap-2 transition-colors">
                  <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="border-l-4 border-l-[#1F2E46] border-y-[3px] border-y-transparent ml-0.5" />
                  </span>
                  Play
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-b from-[#F3F8FF] to-[#C0DBFF] rounded-[22px] md:rounded-3xl p-4 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[230px] md:min-h-[300px]">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {c.trainerTitle}
              </h3>
              <p className="text-xs md:text-sm text-gray-700 mt-3 md:mt-4 leading-relaxed w-[170px] md:w-60">
                {c.trainerDesc}
              </p>
            </div>

            <div className="flex items-end justify-between mt-6">
              <Link
                href="/training"
                className="bg-[#1F2E46] hover:bg-black text-white text-xs md:text-sm font-bold px-4 md:px-5 py-2.5 md:py-3 rounded-full transition-all z-10"
              >
                {c.bookCta}
              </Link>

              <img
                src={c.trainerImg}
                alt="trainer"
                className="absolute bottom-0 right-0 w-28 md:w-44 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
