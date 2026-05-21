import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

const TermsOfService = () => {
    // Dummy data object based on the provided images
    const termsData = [
        {
            id: 1,
            title: "About FURRMAA",
            content: "FURRMAA is an AI-powered pet care platform that connects pet parents with products, services, veterinarians, content, and verified third-party service providers. FURRMAA does not itself provide veterinary, medical, grooming, boarding, or cremation services. These services are offered by independent partners."
        },
        {
            id: 2,
            title: "Eligibility",
            content: "You must: Be at least 18 years of age, Be legally capable of entering into binding contracts, Provide accurate and complete information. By using the Platform, you confirm that you meet these requirements."
        },
        {
            id: 3,
            title: "User Accounts",
            content: "You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your responsibility. You must notify us immediately of unauthorized access. FURRMAA reserves the right to suspend or terminate accounts that violate these Terms."
        },
        {
            id: 4,
            title: "Platform Usage",
            content: "You agree not to: Misuse the Platform or its services, Provide false, misleading, or harmful information, Upload unlawful, abusive, or infringing content, Attempt to disrupt or compromise system security. Any misuse may result in account suspension or termination."
        },
        {
            id: 5,
            title: "Products & Services",
            content: "Product listings, prices, availability, and delivery are subject to change. Services are provided by independent third-party partners. FURRMAA is not responsible for service outcomes, delays, or disputes. All transactions are governed by applicable laws and partner policies."
        },
        {
            id: 6,
            title: "AI Chatbot Disclaimer",
            content: "The AI chatbot provides general informational guidance only. It Does not replace professional veterinary advice. Should not be used for medical diagnosis or treatment decisions. Always consult a licensed veterinarian for medical concerns."
        },
        {
            id: 7,
            title: "Payments & Subscriptions",
            content: "Payments may be required for products, services, or premium features. Subscription plans, pricing, and billing terms will be clearly disclosed. Refunds, if applicable, are governed by our Refund Policy. Failure to complete payment may result in restricted access."
        },
        {
            id: 8,
            title: "Third-Party Partners",
            content: "FURRMAA connects users with third-party service providers. We verify partners at onboarding but do not control their operations, pricing, or conduct. Any disputes must be resolved directly with the service provider. FURRMAA is not liable for the acts or omissions of these partners."
        },
        {
            id: 9,
            title: "Intellectual Property",
            content: "All content, logos, designs, trademarks, and software on FURRMAA are owned by or licensed to FURRMAA. You may not copy, distribute, or use any content without written permission."
        },
        {
            id: 10,
            title: "Limitation of Liability",
            content: "To the maximum extent permitted by law: FURRMAA is not liable for indirect, incidental, or consequential damages. Use of the Platform is at your own risk."
        },
        {
            id: 11,
            title: "Termination",
            content: "We may suspend or terminate access: For violation of these Terms, For legal or security reasons, Without prior notice if required."
        },
        {
            id: 12,
            title: "Governing Law",
            content: "These Terms are governed by the laws of India. Courts in Jaipur, Rajasthan shall have exclusive jurisdiction."
        },
        {
            id: 13,
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
                            Terms of Services
                        </h1>
                        <p className="text-sm font-bold text-black opacity-70">
                            Last Updated: 01 January 2026
                        </p>
                    </header>

                    {/* Content Body */}
                    <div className="space-y-8 text-black leading-relaxed">
                        
                        <div className="space-y-4">
                            <p className="font-bold">
                                Welcome to FURRMAA. <span className="font-normal">These Terms of Service ("Terms") govern your access to and use of the FURRMAA website, mobile applications, and related services (collectively, the "Platform").</span>
                            </p>
                            <p>
                                By accessing or using FURRMAA, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
                            </p>
                        </div>

                        {/* Mapping over the data object */}
                        <div className="space-y-8">
                            {termsData.map((item) => (
                                <div key={item.id} className="space-y-2">
                                    <h2 className="text-lg font-extrabold uppercase tracking-wide">
                                        {item.id}. {item.title}
                                    </h2>
                                    <p className="text-[15px]">
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </Container>
            <WhyChooseFurrmaa/>
        </section>
    );
};

export default TermsOfService;