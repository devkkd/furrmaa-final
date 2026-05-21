import React from 'react';
import { FaLock } from 'react-icons/fa';

const Plans = () => {
    // Static data defined exactly as per the UI reference
    const trainingTiers = [
        {
            id: 'basic',
            title: "Basic Training",
            description: "Foundation skills, simple commands, bonding.",
            color: "bg-[#FDE68A]",
            textColor: "text-gray-900",
            tags: ["7 Lessons", "7 Days", "7 Great Ways to Training"],
            isFree: true,
            image: "/images/training/basic-dog.png"
        },
        {
            id: 'intermediate',
            title: "Intermediate Training",
            description: "Discipline, behavior shaping, control.",
            color: "bg-[#E29587]",
            textColor: "text-white",
            tags: ["14 Lessons", "14 Days", "14 Great Ways to Training"],
            isFree: false,
            image: "/images/training/intermediate-dog.png"
        },
        {
            id: 'advanced',
            title: "Advanced Training",
            description: "Master-level commands, agility, obedience.",
            color: "bg-[#6366F1]",
            textColor: "text-white",
            tags: ["12 Lessons", "21 Days", "21 Great Ways to Training"],
            isFree: false,
            image: "/images/training/advanced-dog.png"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {trainingTiers.map((tier) => (
                <div

                    key={tier.id}
                    onClick={() => setSelectedPlan(tier.id)}
                    className={` ${tier.id === "basic"
                        ? "bg-gradient-to-b from-[#FFE5B4] to-[#FFCC80]"
                        : tier.id === "intermediate"
                            ? "bg-gradient-to-b from-[#DC928B] to-[#B8685B]"
                            : tier.id === "advanced"
                                ? "bg-gradient-to-b from-[#7F7CFF] to-[#4C4AEF]"
                                : ""
                        } rounded-[32px] p-8 relative overflow-hidden h-[320px] shadow-sm cursor-pointer`}
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className={`text-2xl font-extrabold ${tier.textColor}`}>{tier.title}</h2>
                                {tier.isFree ? (
                                    <span className="bg-white/90 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Free</span>
                                ) : (
                                    <div className="bg-white/20 p-2 rounded-full">
                                        <FaLock className="text-white text-xs" />
                                    </div>
                                )}
                            </div>
                            <p className={`text-sm ${tier.textColor} opacity-80 mb-6 max-w-[200px]`}>
                                {tier.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tier.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="bg-white/20 text-[9px] font-bold px-3 py-1 rounded-full border border-white/30"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button className={`flex items-center gap-2 font-extrabold text-sm ${tier.textColor}`}>
                            Let's Start ➔
                        </button>
                    </div>
                    <img src={tier.image} alt={tier.title} className="absolute bottom-0 right-0 w-48" />
                </div>
            ))}
        </div>
    );
};

export default Plans;