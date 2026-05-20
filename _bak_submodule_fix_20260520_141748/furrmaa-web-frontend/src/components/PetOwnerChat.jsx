import React from 'react';
import Image from 'next/image';
import Container from './Container';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const PetOwnerChat = () => {
    const chatFeatures = [
        "Ask questions before adopting",
        "Coordinate meetups safely",
        "Share updates for lost or found pets",
        "Get faster, more reliable responses",
    ];

    const mobileBenefits = [
        "Location-aware matching",
        "Instant chat notifications",
        "Faster posting and updates",
        "A secure, pet-first community",
    ];

    return (
        <section className="mx-auto px-6 py-12 bg-white">
            <Container>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    
                    {/* Left Content Column */}
                    <div className="flex-1 space-y-8 order-1 lg:order-1">
                        <header>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
                                Chat Directly with Pet Owners
                            </h1>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Real Conversations That Lead to Real Help
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                                Hope makes it easy to chat directly with pet owners, rescuers, 
                                or adopters—no middlemen, no delays.
                            </p>
                        </header>

                        <div className="space-y-8">
                            {/* Section 1: In-app chat capabilities */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    With in-app chat, you can:
                                </h3>
                                <ul className="space-y-3">
                                    {chatFeatures.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-sm text-gray-500 italic">
                                    For privacy, safety, and real-time notifications, Hope Chat is available only in the <span className="font-bold text-gray-700">Furrmaa app.</span>
                                </p>
                            </div>

                            {/* Section 2: Why it works better */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Why Hope Works Better in the App
                                </h3>
                                <p className="text-gray-600 mb-4">The mobile app is designed to act fast when pets need help:</p>
                                <ul className="space-y-3">
                                    {mobileBenefits.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-6 text-gray-600 font-medium">
                                    If you are serious about helping or finding help the app is essential.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                One App. One Community. Real Impact.
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <span className="font-bold text-gray-900">Download the Furrmaa app to:</span><br />
                                Post on Hope, Chat with pet owners, Support lost, found, and adoption cases anytime, anywhere.
                            </p>

                            {/* Store Badges */}
                            <div className="flex flex-wrap gap-4">
                                <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                                    <FaApple className="text-2xl" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase">Download on the</span>
                                        <span className="text-sm font-semibold">App Store</span>
                                    </div>
                                </button>

                                <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                                    <FaGooglePlay className="text-xl" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase">Get it on</span>
                                        <span className="text-sm font-semibold">Google Play</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Phone Image Column */}
                    <div className="flex-1 flex justify-center lg:justify-end order-2 lg:order-2">
                        <div className="relative w-[320px] md:w-[450px]">
                            <Image
                                src="/images/Hopes/PetOwnerChat.png" // Replace with your actual path for this image
                                alt="Furrmaa Chat Interface"
                                width={450}
                                height={900}
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

// Reusable Checkmark Icon to match your UI
const CheckCircle = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
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

export default PetOwnerChat;