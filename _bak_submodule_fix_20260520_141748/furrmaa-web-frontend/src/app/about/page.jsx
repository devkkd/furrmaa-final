"use client"
import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

const AboutUs = () => {
    return (
        <section className="bg-white pt-6 md:py-12">
            <Container>
                <div className="max-w-7xl pl-9 pr-8 md:pl-9 md:pr-9 ">
                    {/* --- EXISTING TOP SECTION --- */}
                    <div className="">
                        <h2 className="text-2xl mb-3 md:text-4xl font-extrabold text-gray-800">
                            About Us
                        </h2>
                        <h1 className="text-4xl my-7 md:text-5xl lg:text-6xl font-bold text-black tracking-tight leading-tight mb-6">
                            Reimagining Pet Care in India
                        </h1>
                    </div>

                    <div className="space-y-6 max-w-6xl text-[#0E0E0E]">
                        <p className=" md:text-xl leading-relaxed">
                            <span className="font-bold  tracking-wide">Furrmaa is
                            India's emerging AI-powered pet care ecosystem </span>, built to simplify pet parenting
                            and create sustainable growth opportunities for pet care businesses.
                        </p>
                        <p className="md:text-lg leading-relaxed">
                            We believe pet care should be accessible, reliable, local, and intelligent—not fragmented,
                            confusing, or dependent on chance discovery.
                            <span className="font-bold ml-1">FURRMAA</span> exists to bring structure, trust,
                            and technology into the everyday lives of pet parents and the businesses that serve them.
                        </p>
                    </div>

                    <div className="mt-10 ml-auto mr-auto relative aspect-[15/6.5] h-[100%] w-[100%] overflow-hidden rounded-[10px] md:rounded-[15px] shadow-xl">
                        <img
                            src="/images/AboutFurrmaa/aboutfurrma.png"
                            alt="Man with his Golden Retriever"
                            className=" h-full  object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>

                    {/* --- NEW SECTION: THE REALITY OF PET CARE TODAY --- */}
                    <div className="mt-12 mb-15">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">
                            The Reality of Pet Care Today
                        </h2>
                        <p className="md:text-lg text-[#0E0E0E] mb-8">
                            Despite the growing love for pets across India, the pet care ecosystem remains disconnected.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left Column: Pet Parents */}
                            <div>
                                <h3 className="text-lg font-bold mb-6 text-black">Pet parents often face:</h3>
                                <ul className="space-y-2 text-[#0E0E0E]">
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Difficulty finding trustworthy vets and services nearby
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Uncertainty about product quality and authenticity
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Lack of timely guidance during emergencies
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Scattered information across multiple platforms
                                    </li>
                                </ul>
                            </div>

                            {/* Right Column: Businesses */}
                            <div className="md:border-l md:pl-12 border-gray-300">
                                <h3 className="text-lg font-bold mb-6 text-black">Meanwhile, pet care businesses struggle with:</h3>
                                <ul className="space-y-2 text-[#0E0E0E]">
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Limited digital visibility
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> Dependence on walk-in customers
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> High marketing and advertising costs
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>→</span> No access to modern tools or data-driven discovery
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <h3 className="text-lg md:text-xl font-bold text-black mb-2">
                                Good pet care exists - but it is hard to find.
                            </h3>
                            <div className='flex  justify-center gap-1.5'>
                                {/* <p className="text-xl md:text-2xl font-extrabold text-black uppercase">
                                    FURRMAA
                                </p> */}
                                <p className='text-lg md:text-xl text-black'> <span className='font-extrabold text-black' >FURRMAA</span> was created to solve this exact problem.</p>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW SECTION: WHAT IS FURRMAA? --- */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 mt-12 md:mt-20">
                        {/* Content */}
                        <div className="flex-1 space-y-6 text-[#0E0E0E]">
                            <h2 className="text-3xl md:text-3xl font-extrabold text-black">
                                What is FURRMAA?
                            </h2>
                            <p className="md:text-md leading-relaxed">
                                <span className="font-bold">FURRMAA</span> is a unified pet care platform that connects pet parents with verified
                                products, services, veterinarians, hostels, groomers, trainers, NGOs, and trusted
                                local partners - on one intelligent platform.
                            </p>
                            <p className="md:text-lg leading-relaxed">
                                By combining technology, local discovery, and quality partnerships, we make pet
                                care simpler, faster, and more dependable.
                            </p>

                            <div className="pt-2">
                                <h3 className="text-xl font-extrabold text-black mb-4">FURRMAA is designed for</h3>
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2"><span>→</span> Daily pet needs</li>
                                    <li className="flex items-center gap-2"><span>→</span> Preventive care</li>
                                    <li className="flex items-center gap-2"><span>→</span> Emergency support</li>
                                    <li className="flex items-center gap-2"><span>→</span> Community connection</li>
                                    <li className="flex items-center gap-2"><span>→</span> Long-term pet well-being</li>
                                </ul>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="flex-1 w-full relative aspect-[4/3] overflow-hidden rounded-[20px] shadow-lg">
                            <img
                                src="/images/AboutFurrmaa/about2.png"
                                alt="Man hugging his dog outdoors"
                                className="w-full h-full object-cover "
                            />

                        </div>
                    </div>
                    {/* --- ECOSYSTEM SECTION --- */}
                    <EcoSystem />
                    {/* --- MISSION & PARTNERS SECTION --- */}
                    <OurMssionAndPartner />
                </div>
            </Container>
            {/* WhyChooseFurrmaa */}
            <WhyChooseFurrmaa />
        </section>
    );
};

const EcoSystem = () => {
    const ecosystemItems = [
        "Pet essentials and supplies",
        "Verified service providers",
        "Veterinary access and bookings",
        "AI-powered assistance and reminders",
        "Training and educational content",
        "Community-driven pet engagement"
    ];

    const differentiators = [
        {
            id: "01.",
            title: "Partner-First, Not Ad-First",
            desc: "We do not sell visibility through ads. Growth on FURRMAA is driven by quality, reliability, and relevance—not bidding wars."
        },
        {
            id: "02.",
            title: "Quality Over Quantity",
            desc: "We focus on onboarding the right partners - not everyone. This ensures pet parents see fewer, better, and more reliable options."
        },
        {
            id: "03.",
            title: "Local Discovery That Matters",
            desc: "FURRMAA prioritizes nearby, verified businesses so pet parents get faster, more dependable service when it matters most."
        },
        {
            id: "04.",
            title: "Built for Indian Pet Care",
            desc: "From pricing sensitivity to local service behavior, FURRMAA is designed specifically for Indian pet parents and businesses—not adapted from global templates."
        },
        {
            id: "05.",
            title: "Technology with Purpose",
            desc: "AI at FURRMAA is used to reduce effort, not replace care—guiding discovery, reminders, and decision-making responsibly."
        }
    ];

    return (
        <section className="bg-white py-12">
            <Container>
                <div className="max-w-7xl">

                    {/* --- OUR ECOSYSTEM APPROACH --- */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mt-10">
                        {/* Desktop Image Column: Hidden on Mobile, visible on Large screens */}
                        <div className="hidden lg:block flex-1 w-full relative aspect-[4/3] overflow-hidden rounded-[20px] shadow-lg">
                            <img
                                src="/images/AboutFurrmaa/about3.png"
                                alt="Man shaking hands with dog"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Text Column */}
                        <div className="flex-1 space-y-6 text-left md:text-right lg:text-right">
                            <h2 className="text-3xl md:text-3xl font-extrabold text-black">
                                Our Ecosystem Approach
                            </h2>

                            <p className="md:text-md text-gray-800 leading-relaxed max-w-xl ml-auto">
                                Unlike traditional marketplaces or directories, <span className="font-bold text-black">FURRMAA</span> is built as an <span className="font-bold text-black">ecosystem</span>, not a listing site.
                            </p>

                            <p className="md:text-md text-gray-800 leading-relaxed max-w-xl ml-auto">
                                Every feature, partner, and recommendation is designed to work together - ensuring clarity for pet parents and sustainable growth for businesses.
                            </p>

                            {/* Mobile-Only Image: Visible only on Mobile, placed between second paragraph and list */}
                            <div className="block lg:hidden w-full relative aspect-[4/3] overflow-hidden rounded-[20px] shadow-lg my-8">
                                <img
                                    src="/images/AboutFurrmaa/about3.png"
                                    alt="Man shaking hands with dog"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="pt-2 ">
                                <h3 className="text-2xl font-bold text-black mb-4">Our ecosystem includes</h3>
                                <ul className="space-y-2 text-gray-800">
                                    {ecosystemItems.map((item, index) => (
                                        <li key={index} className="flex items-center justify-start md:justify-end gap-2 ">
                                          <span className="">→</span>  {item} 
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* --- WHAT MAKES FURRMAA DIFFERENT --- */}
                    <div className="mt-16">
                        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-black mb-10">
                            What Makes FURRMAA Different
                        </h2>

                        {/* Horizontal scrolling or wrapping grid for cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {differentiators.map((card) => (
                                <div
                                    key={card.id}
                                    className="p-4.5 rounded-[24px] border border-gray-200 transition-all duration-300 cursor-default
                                               hover:scale-105 hover:shadow-xl hover:border-transparent group flex flex-col"
                                    style={{
                                        '--hover-bg': 'linear-gradient(180deg, #F3F8FF 0%, #C0DBFF 100%)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(180deg, #F3F8FF 0%, #C0DBFF 100%)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <span className="text-xl font-bold text-black mb-4 block">
                                        {card.id}
                                    </span>
                                    <h4 className="text-lg font-extrabold text-black mb-3 leading-tight">
                                        {card.title}
                                    </h4>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                        {card.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
};
const OurMssionAndPartner = () => {
    const partners = [
        "Veterinary Clinics & Hospitals",
        "Pet Shops & Medical Stores",
        "Pet Hostels & Boarding Facilities",
        "Groomers & Trainers",
        "NGOs & Rescue Organizations",
        "Specialized Pet Care Providers"
    ];
    const parentTrustPoints = [
        "Verified and reviewed partners",
        "Transparent discovery without spam",
        "Clear information and honest recommendations",
        "Local reliability over random options",
        "A platform designed to reduce stress, not add complexity"
    ];

    const businessBenefits = [
        "Increased digital visibility",
        "Access to nearby pet parents",
        "Zero ad spend requirement",
        "Technology-enabled discovery",
        "Phase-wise AI-driven demand generation",
        "Long-term ecosystem participation"
    ];

    return (
        <section className="bg-white ">
            <Container>
                <div className="max-w-7xl">

                    {/* --- OUR MISSION & VISION HERO --- */}
                    <div className="flex flex-col md:block my-8">
                        {/* Mobile Header (Visible only on small screens) */}
                        <div className="block md:hidden space-y-8 mb-6">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-extrabold text-black">Our Mission</h2>
                                <p className="md:text-lg text-gray-800 leading-relaxed">
                                    To simplify pet parenting and empower pet care businesses by building a trusted, intelligent, and locally connected pet care ecosystem.
                                </p>
                            </div>
                        </div>

                        {/* Main Container */}
                        <div className="relative aspect-[16/9] md:aspect-[15/5.5] h-full w-full overflow-hidden rounded-[10px] md:rounded-[15px] shadow-xl">
                            {/* Background Image */}
                            <img
                                src="/images/AboutFurrmaa/about4.png"
                                alt="Furrmaa Mission and Vision"
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Dark Overlay (Hidden on mobile if text is outside, or kept for style) */}
                            <div className="hidden md:block absolute inset-0 bg-black/40" />

                            {/* Desktop Content Overlay (Hidden on mobile) */}
                            <div className="hidden md:flex absolute inset-0 flex-row items-stretch justify-between p-10 lg:p-16 gap-12 text-white">

                                {/* Mission - Left Side */}
                                <div className="flex-1 flex flex-col justify-around">
                                    {/* Red Circle Position: Heading at the top */}
                                    <h2 className="text-4xl md:text-4xl font-bold">Our Mission</h2>

                                    {/* Blue Box Position: Content at the bottom */}
                                    <div className="max-w-xs">
                                        <p className="text-lg md:text-lg leading-10 opacity-90">
                                            To simplify pet parenting and empower pet care businesses by building a trusted, intelligent, and locally connected pet care ecosystem.
                                        </p>
                                    </div>
                                </div>

                                {/* Vision - Right Side (Exact Opposite) */}
                                <div className="flex-1 flex flex-col justify-around text-right">
                                    {/* Heading at the top */}
                                    <h2 className="text-4xl md:text-4xl font-bold">Our Vision</h2>

                                    {/* Content at the bottom */}
                                    <div className="max-w-xs ml-auto">
                                        <p className="text-lg md:text-lg leading-10 opacity-90  ">
                                            To become India's most trusted digital companion for pet care where every pet parent feels confident, and every quality service provider grows sustainably.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Vision (Visible only on small screens under the image) */}
                        <div className="block md:hidden mt-8 space-y-4 text-left">
                            <h2 className="text-3xl font-extrabold text-black">Our Vision</h2>
                            <p className="md:text-lg text-gray-800 leading-relaxed">
                                To become India's most trusted digital companion for pet care where every pet parent feels confident, and every quality service provider grows sustainably.
                            </p>
                        </div>
                    </div>

                    {/* --- WHO WE PARTNER WITH --- */}
                    <div className="text-center space-y-12 py-12 mt-3">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-4xl font-extrabold text-black mb-10">
                                Who We Partner With
                            </h2>
                            <p className="text-lg md:text-lg text-gray-800 mb-12 md:mb-20">
                                <span className="font-extrabold text-black">FURRMAA</span>
                                <span className='text-black ml-1.5'>
                                    collaborates with responsible and committed pet care professionals, including:
                                </span>
                            </p>
                        </div>

                        {/* Partners Grid with Vertical Dividers */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center gap-y-10">
                            {partners.map((partner, index) => (
                                <div
                                    key={index}
                                    className={`px-6 h-full flex items-center  justify-center border-gray-300 
                                        ${index !== partners.length - 1 ? 'lg:border-r ' : ''}`}
                                >
                                    <p className=" text-black ">
                                        {partner}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 max-w-6xl mx-auto">
                            <p className="text-lg md:text-lg text-gray-800">
                                If you care for pets professionally and value trust, consistency, and long-term growth - you belong with <span className="font-extrabold text-black">FURRMAA</span>.
                            </p>
                        </div>
                    </div>
                    {/* --- WHY PET PARENTS TRUST FURRMAA --- */}
                    <div className="text-center space-y-12 py-12 mt-3 border-t border-gray-200">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-4xl font-extrabold text-black mb-10">
                                Why Pet Parents Trust FURRMAA
                            </h2>
                            <p className="text-lg md:text-lg text-gray-800 mb-20">
                                Trust is not a feature it is a foundation. We build trust through:
                            </p>
                        </div>

                        {/* Trust Grid with Vertical Dividers */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center gap-y-10">
                            {parentTrustPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className={`px-6 h-full flex items-center justify-center border-gray-300 
                                        ${index !== parentTrustPoints.length - 1 ? 'lg:border-r' : ''}`}
                                >
                                    <p className="text-black leading-tight">
                                        {point}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <p className="text-lg font-extrabold text-black ">
                                Less searching. More caring.
                            </p>
                        </div>
                    </div>

                    {/* --- HELPING PET BUSINESSES GROW --- */}
                    <div className="text-center space-y-12 pt-10 border-t border-gray-200">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-4xl font-extrabold text-black mb-10">
                                Helping Pet Businesses Grow The Right Way
                            </h2>
                            <p className="text-lg md:text-lg text-gray-800 max-w-4xl mx-auto mb-12 md:mb-20">
                                <span className="font-extrabold text-black">FURRMAA</span> enables growth without forcing businesses into heavy marketing or discounting. Our partner benefits include:
                            </p>
                        </div>

                        {/* Business Grid with Vertical Dividers */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center gap-y-10">
                            {businessBenefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className={`px-6 h-full flex items-center justify-center border-gray-300 
                                        ${index !== businessBenefits.length - 1 ? 'lg:border-r' : ''}`}
                                >
                                    <p className="text-black ">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-7 md:pt-12">
                            <p className="text-lg text-gray-800 font-medium">
                                You focus on caring for pets. <span className="font-extrabold text-black">We handle discovery and growth.</span>
                            </p>
                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
};

export default AboutUs;