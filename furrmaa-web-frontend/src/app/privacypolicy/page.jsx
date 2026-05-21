import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

const PrivacyPolicy = () => {
    // Data object for Privacy Policy sections
    const privacyData = [
        {
            id: 1,
            title: "Information We Collect",
            content: "We may collect the following information: Personal Information, Name, email address, phone number, Account and profile details, Pet-related information, Usage Information, App usage data, Device information, Location (approximate, if enabled), Transaction Information, Orders, bookings, and payment records."
        },
        {
            id: 2,
            title: "How We Use Your Information",
            content: "We use your data to: Provide and improve our services, Process orders and bookings, Enable AI-powered features, Send notifications, reminders, and updates, Improve platform performance and security."
        },
        {
            id: 3,
            title: "Data Sharing",
            content: "We may share information with: Verified service partners (only as required), Payment gateways and service providers, Legal or regulatory authorities (if required by law). We do not sell your personal data to third parties."
        },
        {
            id: 4,
            title: "Data Security",
            content: "We use industry-standard security measures to protect your information, including: Secure servers, Encrypted communications, Restricted access controls. However, no system is completely secure."
        },
        {
            id: 5,
            title: "Cookies & Tracking",
            content: "FURRMAA may use cookies and similar technologies to: Improve user experience, Analyze usage patterns, Enable essential platform functionality. You can control cookies through your browser settings."
        },
        {
            id: 6,
            title: "User Rights",
            content: "You have the right to: Access your personal data, Update or correct your information, Request deletion of your account, Withdraw consent (where applicable). Requests can be sent to support@furrmaa.in."
        },
        {
            id: 7,
            title: "Children's Privacy",
            content: "FURRMAA does not knowingly collect data from individuals under 18 years of age."
        },
        {
            id: 8,
            title: "Third-Party Links",
            content: "Our Platform may contain links to third-party websites or services. We are not responsible for their privacy practices."
        },
        {
            id: 9,
            title: "Policy Updates",
            content: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date."
        },
        {
            id: 13, // Matched to image numbering
            title: "Contact Us",
            content: "support@furrmaa.in | www.furrmaa.in | +91 88290 26003"
        }
    ];

    return (
        <section className="bg-white py-12 md:py-20 min-h-screen">
            <Container>
                <div className="max-w-7xl mx-auto px-6 md:px-9 space-y-10">
                    
                    {/* Header Section */}
                    <header className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-sm font-bold text-black opacity-70">
                            Last Updated: 01 January 2026
                        </p>
                    </header>

                    {/* Intro Text */}
                    <div className="text-black leading-relaxed">
                        <p className="font-medium">
                            <span className="font-extrabold">FURRMAA</span> respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data.
                        </p>
                    </div>

                    {/* Mapping over Privacy Data */}
                    <div className="space-y-8 text-black">
                        {privacyData.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <h2 className="text-lg font-extrabold uppercase tracking-wide">
                                    {item.id}. {item.title}
                                </h2>
                                <p className="text-[15px] leading-relaxed">
                                    {item.content}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </Container>
            <WhyChooseFurrmaa />
        </section>
    );
};

export default PrivacyPolicy;