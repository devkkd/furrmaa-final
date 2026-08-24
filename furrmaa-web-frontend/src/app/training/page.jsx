"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { FaLock } from "react-icons/fa";
import LessonCard from "@/components/LessonCard";
import { useTrainingVideos } from "@/hooks/useTrainingVideos";
import { usePetStore } from "@/store/petStore";
import WhyChooseFurrmaa from "@/components/WhyChooseFurrmaa";
import { fetchSubscription } from "@/lib/api";

const PetTrainingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const petType = usePetStore((s) => s.petType || "dog");
  const router = useRouter();

  const {
    programs: trainingProgram,
    loading,
    progressByPlan,
    error,
    refetch,
  } = useTrainingVideos({ petType });

  useEffect(() => {
    let cancelled = false;

    fetchSubscription()
      .then((d) => {
        if (cancelled) return;

        const sub = d?.subscription;

        setHasPremiumAccess(
          Boolean(
            sub &&
              (sub.plan === "premium" ||
                sub.plan === "premium_plus" ||
                sub.planType === "training")
          )
        );
      })
      .catch(() => {
        if (!cancelled) {
          setHasPremiumAccess(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlan = trainingProgram.find(
    (p) => p.program === selectedPlan
  );

  const currentLessons = currentPlan?.sessions || [];

  return (
    <section className="w-full bg-white py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 overflow-hidden">
      <Container>
        {/* Header */}
        <header className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2">
            Pet Training
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
            Start where your pet feels comfortable
          </p>
        </header>

        {/* Loading */}
        {loading ? (
          <div className="py-10 sm:py-12 text-center md:text-left">
            <p className="text-gray-500 text-sm md:text-base">
              Loading training programs...
            </p>
          </div>
        ) : error ? (
          <div className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-red-700 font-medium text-sm md:text-base mb-2">
              Training data could not be loaded from the server.
            </p>

            <p className="text-gray-600 text-xs sm:text-sm mb-4 break-words">
              {error}
            </p>

            <p className="text-gray-500 text-[11px] sm:text-xs mb-4 leading-5">
              Ensure backend is running (e.g.{" "}
              <code className="bg-gray-200 px-1 rounded">npm start</code> in
              backend folder) and{" "}
              <code className="bg-gray-200 px-1 rounded break-all">
                NEXT_PUBLIC_API_URL
              </code>{" "}
              points to it.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 sm:px-6 py-2 bg-[#1F2E46] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        ) : trainingProgram.length === 0 ? (
          <p className="text-gray-500 py-10 sm:py-12 text-sm md:text-base">
            No training programs available. Check back later.
          </p>
        ) : (
          <>
            {/* Training Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-16">
              {trainingProgram.map((tier) => (
                <div
                  key={tier.program ?? tier.id ?? tier.title}
                  onClick={() => {
                    if (
                      (tier.program === "intermediate" ||
                        tier.program === "advanced") &&
                      !hasPremiumAccess
                    ) {
                      router.push("/training/subscribe");
                      return;
                    }

                    setSelectedPlan(tier.program);
                  }}
                  className={`
                    ${
                      tier.program === "basic"
                        ? "bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80]"
                        : tier.program === "intermediate"
                        ? "bg-gradient-to-b from-[#DC928B] to-[#B8685B]"
                        : tier.program === "advanced"
                        ? "bg-gradient-to-b from-[#7F7CFF] to-[#4C4AEF]"
                        : ""
                    }
                    rounded-[20px] sm:rounded-[24px] md:rounded-[32px]
                    p-5 sm:p-6 md:p-8
                    relative overflow-hidden
                    min-h-[250px] sm:min-h-[270px] md:min-h-[320px]
                    shadow-sm cursor-pointer
                    transform hover:scale-[1.02]
                    transition-transform duration-300
                  `}
                >
                  <div className="relative z-10 h-full min-h-[210px] sm:min-h-[230px] md:min-h-[260px] flex flex-col justify-between pr-8 sm:pr-10 md:pr-12">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
                        <h2
                          className={`text-lg sm:text-xl md:text-2xl font-extrabold ${tier.textColor}`}
                        >
                          {tier.title}
                        </h2>

                        {tier.isFree ? (
                          <span className="shrink-0 bg-white/90 text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase shadow-sm">
                            Free
                          </span>
                        ) : (
                          <div className="shrink-0 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <FaLock className="text-white text-[10px] sm:text-xs" />
                          </div>
                        )}
                      </div>

                      <p
                        className={`
                          text-xs sm:text-sm
                          ${tier.textColor}
                          opacity-80
                          mb-4 sm:mb-5 md:mb-6
                          max-w-[85%] sm:max-w-[80%] md:max-w-[200px]
                          line-clamp-3 sm:line-clamp-4 md:line-clamp-none
                          leading-5
                        `}
                      >
                        {tier.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full">
                        {(tier.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className={`
                              text-[9px] sm:text-[10px] md:text-[12px]
                              font-medium
                              px-2 sm:px-2.5
                              py-1
                              rounded-full
                              border
                              ${tier.textColor}
                            `}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className={`
                        flex items-center gap-2
                        font-extrabold
                        text-sm sm:text-base md:text-lg
                        mt-5 sm:mt-6 md:mt-0
                        ${tier.textColor}
                      `}
                    >
                      Let&apos;s Start ➔
                    </button>
                  </div>

                  <img
                    src={tier.image}
                    alt={tier.title}
                    className="
                      absolute
                      bottom-0
                      right-0
                      w-24 sm:w-32 md:w-48
                      pointer-events-none
                      opacity-80 sm:opacity-90 md:opacity-100
                    "
                  />
                </div>
              ))}
            </div>

            {/* Progress Section */}
            <div
              className={`
                ${
                  selectedPlan === "basic"
                    ? "bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80] text-black"
                    : selectedPlan === "intermediate"
                    ? "bg-gradient-to-b from-[#DC928B] to-[#B8685B] text-white"
                    : selectedPlan === "advanced"
                    ? "bg-gradient-to-b from-[#7F7CFF] to-[#4C4AEF] text-white"
                    : ""
                }
                rounded-[18px] sm:rounded-[20px] md:rounded-[24px]
                p-5 sm:p-6 md:p-8
                mb-8 sm:mb-10 md:mb-12
                flex flex-col
                md:flex-row
                justify-between
                items-start md:items-center
                gap-5 sm:gap-6
                shadow-sm
              `}
            >
              <div className="w-full md:w-auto">
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-1 md:mb-2">
                  {currentPlan?.title}
                </h3>

                <p className="text-xs sm:text-sm md:text-lg font-bold opacity-80 uppercase tracking-widest">
                  Lessons
                </p>
              </div>

              <div className="bg-[#95E562]/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-2xl w-full md:w-[450px]">
                <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-gray-800 mb-2 sm:mb-3">
                  <span>Learning Progress</span>

                  <span>
                    {progressByPlan[selectedPlan] ?? 0}%
                  </span>
                </div>

                <div className="w-full bg-white/50 h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#a3e635] h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressByPlan[selectedPlan] ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="mb-10 sm:mb-12 md:mb-16">
              {currentLessons.length === 0 ? (
                <p className="text-gray-500 py-8 text-center md:text-left text-sm md:text-base">
                  No lessons available for this program yet.
                </p>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-2
                    md:grid-cols-4
                    lg:grid-cols-7
                    gap-2.5
                    sm:gap-3
                    md:gap-4
                  "
                >
                  {currentLessons.map((lesson, index) => (
                    <LessonCard
                      key={
                        lesson.id ??
                        lesson._id ??
                        `lesson-${index}`
                      }
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