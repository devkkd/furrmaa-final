"use client";

import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { FaPlay, FaLock } from 'react-icons/fa';
import LessonCard from '@/components/LessonCard';
import { useTrainingVideos } from '@/hooks/useTrainingVideos';
import { usePetStore } from '@/store/petStore';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';
import { fetchSubscription } from '@/lib/api';

const PetTrainingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const petType = usePetStore((s) => s.petType || 'dog');
  const router = useRouter();

  const { programs: trainingProgram, loading, progressByPlan, error, refetch } = useTrainingVideos({ petType });

  useEffect(() => {
    let cancelled = false;
    fetchSubscription()
      .then((d) => {
        if (cancelled) return;
        const sub = d?.subscription;
        setHasPremiumAccess(Boolean(sub && (sub.plan === 'premium' || sub.plan === 'premium_plus' || sub.planType === 'training')));
      })
      .catch(() => {
        if (!cancelled) setHasPremiumAccess(false);
      });
    return () => { cancelled = true; };
  }, []);

  const currentPlan = trainingProgram.find((p) => p.program === selectedPlan);
  const currentLessons = currentPlan?.sessions || [];

  const lessonsPerWeek = 7;
  const lessonWeeks = [];
  for (let i = 0; i < currentLessons.length; i += lessonsPerWeek) {
    lessonWeeks.push(currentLessons.slice(i, i + lessonsPerWeek));
  }

  return (
    <section className="bg-white py-8 md:py-12 px-3y">
      <Container>
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2">Pet Training</h1>
          <p className="text-sm md:text-base text-gray-600 font-medium">Start where your pet feels comfortable</p>
        </header>

        {loading ? (
          <p className="text-gray-500 py-12">Loading training programs...</p>
        ) : error ? (
          <div className="py-8 md:py-12 px-4 md:px-6 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-red-700 font-medium mb-2">Training data could not be loaded from the server.</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <p className="text-gray-500 text-xs mb-4">Ensure backend is running (e.g. <code className="bg-gray-200 px-1 rounded">npm start</code> in backend folder) and <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_API_URL</code> points to it.</p>
            <button type="button" onClick={() => refetch()} className="px-6 py-2 bg-[#1F2E46] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Retry</button>
          </div>
        ) : trainingProgram.length === 0 ? (
          <p className="text-gray-500 py-12">No training programs available. Check back later.</p>
        ) : (
          <>
            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
              {trainingProgram.map((tier) => (
                <div
                  key={tier.program ?? tier.id ?? tier.title}
                  onClick={() => {
                    if ((tier.program === 'intermediate' || tier.program === 'advanced') && !hasPremiumAccess) {
                      router.push('/training/subscribe');
                      return;
                    }
                    setSelectedPlan(tier.program);
                  }}
                  className={`${tier.program === 'basic'
                    ? 'bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80]'
                    : tier.program === 'intermediate'
                      ? 'bg-gradient-to-b from-[#DC928B] to-[#B8685B]'
                      : tier.program === 'advanced'
                        ? 'bg-gradient-to-b from-[#7F7CFF] to-[#4C4AEF]'
                        : ''
                    } rounded-[24px] md:rounded-[32px] p-6 md:p-8 relative overflow-hidden min-h-[280px] md:h-[320px] shadow-sm cursor-pointer transform hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <h2 className={`text-xl md:text-2xl font-extrabold ${tier.textColor}`}>{tier.title}</h2>
                        {tier.isFree ? (
                          <span className="bg-white/90 text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-sm">Free</span>
                        ) : (
                          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <FaLock className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      <p className={`text-xs md:text-sm ${tier.textColor} opacity-80 mb-4 md:mb-6 max-w-[75%] md:max-w-[200px] line-clamp-3 md:line-clamp-none`}>
                        {tier.description}
                      </p>
                      
                      {/* Fixed: Removed invalid 'w-50' class */}
                      <div className="flex flex-wrap gap-2 w-50">
                        {(tier.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className={`text-[10px] md:text-[12px] font-medium px-2.5 py-1 rounded-full border ${tier.textColor} border-${tier.textColor}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className={`flex items-center gap-2 font-extrabold text-base md:text-lg mt-6 md:mt-0 ${tier.textColor}`}>
                      Let&apos;s Start ➔
                    </button>
                  </div>
                  <img 
                    src={tier.image} 
                    alt={tier.title} 
                    className="absolute bottom-0 right-0 w-36 md:w-48 pointer-events-none opacity-90 md:opacity-100" 
                  />
                </div>
              ))}
            </div>

            {/* Progress Section */}
            <div
              className={`${selectedPlan === 'basic'
                ? 'bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80] text-black'
                : selectedPlan === 'intermediate'
                  ? 'bg-gradient-to-b from-[#DC928B] to-[#B8685B] text-white'
                  : selectedPlan === 'advanced'
                    ? 'bg-gradient-to-b from-[#7F7CFF] to-[#4C4AEF] text-white'
                    : ''
                } rounded-[20px] md:rounded-[24px] p-6 md:p-8 mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-6 shadow-sm`}
            >
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold mb-1 md:mb-2">{currentPlan?.title}</h3>
                <p className="text-sm md:text-lg font-bold opacity-80 uppercase tracking-widest">Lessons</p>
              </div>
              <div className="bg-[#95E562]/40 backdrop-blur-sm p-5 md:p-6 rounded-2xl w-full md:w-[450px]">
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-2 md:mb-3">
                  <span>Learning Progress</span>
                  <span>{progressByPlan[selectedPlan] ?? 0}%</span>
                </div>
                <div className="w-full bg-white/50 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#a3e635] h-full transition-all duration-500 ease-out"
                    style={{ width: `${progressByPlan[selectedPlan] ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="mb-12 md:mb-16">
              {currentLessons.length === 0 ? (
                <p className="text-gray-500 py-8 text-center md:text-left">No lessons available for this program yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
                  {currentLessons.map((lesson, index) => (
                    <LessonCard
                      key={lesson.id ?? lesson._id ?? `lesson-${index}`}
                      lesson={lesson}
                      plan={selectedPlan}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Container>
      <WhyChooseFurrmaa />
    </section>
  );
};

export default PetTrainingPage;