import React from 'react';
import Image from 'next/image';
import Container from './Container';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const HopeByFurrmaa = () => {
    const features = [
        "Lost pets",
        "Found pets",
        "Pets available for adoption",
    ];

    const appBenefits = [
        "Add photos and key pet details instantly",
        "Reach nearby users faster with location-based visibility",
        "Receive real-time responses from people who can help",
    ];

    return (
        <section className="mx-auto px-6 py-6 bg-white">
            <Container>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Left Content Column */}
                    <div className="flex-1 space-y-8">
                        <header>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
                                Hope by Furrmaa
                            </h1>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Helping Pets Find Safety, Care, and a Home
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                                Hope connects pet parents, rescuers, and adopters to support
                                pets who are <span className="font-bold text-gray-900">lost, found, or waiting for adoption</span> all in one trusted place.
                            </p>
                        </header>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Post on Hope Only on the Furrmaa App
                                </h3>
                                <p className="font-bold text-gray-800 mb-4">Share. Reach. Help Faster.</p>
                                <p className="text-gray-600 mb-4">Create a <span className="font-bold text-gray-900">Hope post</span> to report:</p>
                                <ul className="space-y-3">
                                    {features.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Posting from the Furrmaa app allows you to:
                                </h3>
                                <ul className="space-y-3">
                                    {appBenefits.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                To add a Hope post, download the Furrmaa mobile app.
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Download the <span className="font-bold text-gray-900">Furrmaa mobile app</span> to access right from your phone.
                            </p>

                            {/* Store Badges */}
                            <div className="flex flex-wrap gap-4">
                                <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                                    <FaApple className="text-xl" />
                                    <span className="text-sm font-medium">App Store</span>
                                </button>

                                <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
                                    <FaGooglePlay className="text-xl" />
                                    <span className="text-sm font-medium">Google Play</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Phone Image Column */}
                    <div className="flex-1 flex justify-center lg:justify-end">
                        <div className="relative w-[320px] md:w-[450px]">
                            <img
                                src="/images/Hopes/hopeByFurrmaa.png"
                                alt="Furrmaa Mobile App Interface"
                                width={350}
                                height={700}
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

// Reusable Checkmark Icon
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

export default HopeByFurrmaa;