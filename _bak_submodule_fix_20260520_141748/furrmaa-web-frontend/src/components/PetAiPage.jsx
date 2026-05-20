import React from 'react';
import Image from 'next/image';
import Container from './Container';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const PetAiPage = () => {
    const aiCapabilities = [
        { title: "Pet Health Guidance", desc: "Get quick insights on symptoms, care, and next steps" },
        { title: "Find Nearby Vet Clinics", desc: "Locate trusted vets around you instantly" },
        { title: "Pet Nutrition Advice", desc: "Tailored food and diet recommendations" },
        { title: "Behavior & Training Tips", desc: "Practical guidance for everyday challenges" },
        { title: "Grooming & Hygiene Support", desc: "Keep your pet clean and comfortable" },
        { title: "Lost & Found Help", desc: "Support when it matters most" },
        { title: "Adoption Guidance", desc: "Make confident adoption decisions" },
        { title: "Pet Events Information", desc: "Discover local pet-friendly events" },
    ];

    const whyAppOnly = [
        "Faster responses",
        "Location-aware recommendations",
        "A seamless, chat-first experience built for pet parents on the go",
    ];

    return (
        <section className="mx-auto px-6 py-12 bg-white">
            <Container>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Left Content Column */}
                    <div className="flex-1 space-y-8">
                        <header>
                            <div className="flex items-center gap-4 mb-6">
                                <h1 className="text-4xl font-extrabold text-gray-900">
                                    Furrmaa Pet AI Chat
                                </h1>
                                <span className="bg-[#a3e635] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Premium
                                </span>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Your Pet's Smart Assistant Right in Your Pocket
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                                Get instant, reliable support for your pet anytime, anywhere. 
                                <span className="font-bold text-gray-900 ml-1">Furrmaa Pet AI Chat</span> is designed exclusively for our mobile app, 
                                giving pet parents fast, personalized guidance in just a few taps.
                            </p>
                        </header>

                        <div className="space-y-8">
                            {/* Capabilities List */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    What You Can Do with Pet AI Chat
                                </h3>
                                <ul className="space-y-4">
                                    {aiCapabilities.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle />
                                            <p className="text-gray-700 leading-tight">
                                                <span className="font-bold text-gray-900">{item.title}</span> – {item.desc}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Why App-Only Section */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Why It's App-Only
                                </h3>
                                <p className="text-gray-600 mb-4">Furrmaa Pet AI Chat is optimized for mobile to deliver:</p>
                                <ul className="space-y-3">
                                    {whyAppOnly.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle />
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* CTA / Download Section */}
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Start Chatting with Your Pet's AI Today
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Download the <span className="font-bold text-gray-900">Furrmaa mobile app</span> to access Pet AI Chat and give your pet smarter care right from your phone.
                            </p>

                            {/* App Store Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:opacity-90 transition shadow-md">
                                    <FaApple className="text-2xl" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase tracking-tighter">Download on the</span>
                                        <span className="text-lg font-semibold tracking-tight">App Store</span>
                                    </div>
                                </button>

                                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:opacity-90 transition shadow-md">
                                    <FaGooglePlay className="text-xl" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase tracking-tighter">Get it on</span>
                                        <span className="text-lg font-semibold tracking-tight">Google Play</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Phone Image */}
                    <div className="flex-1 flex justify-center lg:justify-end">
                        <div className="relative w-[320px] md:w-[480px]">
                            <Image
                                src="/images/Hopes/PetAiPage.png" 
                                alt="Furrmaa Pet AI Chat Interface"
                                width={384}
                                height={768}
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
};

// Standard Checkmark Icon
const CheckCircle = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="#a3e635" />
        <path
            d="M8 12L11 15L16 9"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default PetAiPage;