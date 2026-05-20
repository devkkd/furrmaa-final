import React from "react";
import { FaApple, FaGooglePlay } from "react-icons/fa";


export default function FurrmaaPetAI() {
    return (
        <section
            className="w-full py-20 px-6"
            style={{
                background: "linear-gradient(180deg, #F3F8FF 0%, #C0DBFF 100%)",
            }}
        >            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center lg:gap-80">

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Furrmaa Pet AI Chat
                        </h2>
                        <span className="bg-green-400 text-green-900 text-sm font-semibold px-4 py-1 rounded-full">
                            Premium
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                        Your Pet’s Smart Assistant Right in Your Pocket
                    </h3>

                    <p className="text-gray-900 max-w-xl mb-8">
                        Get instant, reliable support for your pet anytime, anywhere.
                        <span className="font-semibold text-gray-900">
                            {" "}Furrmaa Pet AI Chat
                        </span>{" "}
                        is designed exclusively for our mobile app, giving pet parents
                        fast, personalized guidance in just a few taps.
                    </p>

                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Start Chatting with Your Pet’s AI Today
                    </h4>
                    <p className="text-gray-900 mb-6">
                        Download the{" "}
                        <span className="font-semibold text-gray-900">
                            Furrmaa mobile app
                        </span>{" "}
                        to access Pet AI Chat and give your pet smarter care right from your phone.
                    </p>

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

                <div className="flex justify-center md:justify-end relative w-[260px] md:w-[320px]">

                    <img
                        src="/images/FurrmaChatBot/Pet AI Chat - 6.png"
                        alt="Chat UI"
                        className="absolute top-[4%] left-[7%] w-[86%] h-[94%] object-cover rounded-[28px] z-0"
                    />

                    <img
                        src="/images/FurrmaChatBot/furrmachatbot.png"
                        alt="Phone Frame"
                        className="relative z-10 w-full"
                    />

                </div>

            </div>

        </section>
    );
}
