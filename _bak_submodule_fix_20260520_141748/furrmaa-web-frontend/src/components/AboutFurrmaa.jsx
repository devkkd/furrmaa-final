import React from "react";

export default function AboutFurrmaa() {
    return (
        <section className="w-full bg-[#F8FAFC] py-16">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">

                <div className="w-full md:w-1/2">
                    <p className="text-lg text-gray-900 mb-4">
                        About Furrmaa
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-6">
                        FURRMAA WAS CREATED <br />
                        WITH ONE BELIEF
                    </h2>

                    <p className="text-sm text-gray-900 max-w-md mb-4">
                        Pets are family and they deserve better care, better tools, and
                        better experiences.
                    </p>

                    <p className="text-sm text-gray-900 max-w-md">
                        We combine technology, compassion, and community to redefine how
                        pet care works in the digital age.
                    </p>
                </div>

                <div className="w-full md:w-1/2">
                    <img
                        src="/images/AboutFurrmaa/aboutfurrma.png"
                        alt="Pet care moment"
                        className="w-full h-[320px] md:h-[380px] object-cover rounded-3xl"
                    />
                </div>

            </div>
        </section>
    );
}
