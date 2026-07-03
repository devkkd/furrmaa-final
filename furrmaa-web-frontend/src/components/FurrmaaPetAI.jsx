import React from "react";

export default function FurrmaaPetAI() {
    return (
       <section className="w-full py-8 md:py-20 px-4 md:px-6">
            <div
 className="max-w-7xl rounded-[20px] md:rounded-2xl mx-auto flex flex-col-reverse md:flex-row gap-6 md:gap-12 items-center p-5 md:p-10 lg:gap-80 gap-6 md:gap-12 items-center p-5 md:p-10 lg:gap-80"
                style={{
                    background: "linear-gradient(180deg, #f7f8f9ff 0%, #C0DBFF 100%)",
                }}>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-[22px] md:text-4xl font-bold text-gray-900 leading-tight">
                            Furrmaa Pet AI Chat
                        </h2>
                        <span className="bg-[#95E562] text-green-900 text-[10px] md:text-sm font-semibold px-2 md:px-4 py-1 md:py-2 rounded-full whitespace-nowrap">
                            Premium
                        </span>
                    </div>

                    <h3 className="text-[16px] md:text-xl font-bold text-gray-900 mb-3">
                        Your Pet&apos;s Smart Assistant Right in Your Pocket
                    </h3>

                    <p className="text-[13px] md:text-base leading-6 text-gray-900 max-w-xl mb-5 md:mb-8">
                        Get instant, reliable support for your pet anytime, anywhere.
                        <span className="font-semibold text-gray-900">
                            {" "}Furrmaa Pet AI Chat
                        </span>{" "}
                        is designed exclusively for our mobile app, giving pet parents
                        fast, personalized guidance in just a few taps.
                    </p>

                   <h4 className="text-[16px] md:text-xl font-bold text-gray-900 mb-2">
                        Start Chatting with Your Pet&apos;s AI Today
                    </h4>
                   <p className="text-[13px] md:text-base leading-6 text-gray-900 mb-5 md:mb-6">
                        Download the{" "}
                        <span className="font-semibold text-gray-900">
                            Furrmaa mobile app
                        </span>{" "}
                        to access Pet AI Chat and give your pet smarter care right from your phone.
                    </p>

                    <div className="flex gap-3 md:gap-4">
                        <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                            <img
  src="/images/buttons/apple-button.png"
  className="w-[110px] md:w-32"
 alt="App Store" />
                        </button>
                        <button className="flex items-center gap-2 rounded-xl hover:scale-105 transition">
                           <img
  src="/images/buttons/play-button.png"
  className="w-[110px] md:w-34"
  alt="Google Play"
/>
                        </button>
                    </div>
                </div>

               <div className="flex justify-center md:justify-end relative w-[180px] md:w-[320px] mt-2 md:mt-0">
                    <img
                        src="/images/FurrmaChatBot/Pet AI Chat - 6.png"
                        alt="Chat UI"
                        className="absolute top-[4%] left-[7%] w-[86%] h-[94%] object-cover rounded-[18px] md:rounded-[28px] z-0"
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
