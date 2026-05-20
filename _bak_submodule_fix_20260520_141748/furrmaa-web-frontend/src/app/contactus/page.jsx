"use client"
import React, { useState } from 'react';
import Container from '@/components/Container';
import { HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';
import { submitContact } from '@/lib/api';

const ContactUs = () => {
    // State for form data
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        email: '',
        userType: 'Pet Parent',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const userTypes = ["Pet Parent", "Service Provider", "Partner / Business", "NGO / Rescue", "Other"];

    // Validation: Disable button if required fields are empty
    const isFormIncomplete = !formData.fullName.trim() ||
        !formData.mobileNumber.trim() ||
        !formData.message.trim();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormIncomplete) return;
        
        setSubmitting(true);
        setError('');
        
        try {
            await submitContact({
                fullName: formData.fullName.trim(),
                mobileNumber: formData.mobileNumber.trim(),
                email: formData.email.trim() || undefined,
                userType: formData.userType,
                message: formData.message.trim(),
            });
            setSubmitted(true);
            setFormData({
                fullName: '',
                mobileNumber: '',
                email: '',
                userType: 'Pet Parent',
                message: ''
            });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="bg-white px-7 py-12 md:py-20">
            <Container>
                {/* Header Section */}
                <div className="mb-16 md:px-9">
                    <h2 className="text-2xl mb-3 md:text-4xl font-extrabold text-gray-800">Contact Us</h2>
                    <h1 className="text-4xl my-7 md:text-5xl lg:text-5xl font-bold text-black tracking-tight leading-tight mb-6">
                        We're Here to Help For Pets and People
                    </h1>
                    <p className="text-lg text-gray-800 max-w-4xl leading-relaxed">
                        Have a question, need support, or want to partner with <span className="font-extrabold">FURRMAA</span>?<br></br>
                        <span className="font-extrabold"> We'd love to hear from you.</span> Our team is here to assist pet parents, partners, and collaborators at every step.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:px-9">

                    {/* Left Column: Support Info */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* General Inquiries Card */}
                        <div className="p-8 rounded-[24px] space-y-6 shadow-sm border border-blue-50
    bg-[linear-gradient(180deg,#F3F8FF_0%,#C0DBFF_100%)]">
                            <h3 className="text-lg font-bold text-black">General Inquiries & Support</h3>
                            <p className="text-sm text-gray-700">For app support, orders, or general questions</p>
                            <div className="space-y-3">
                                <a href="tel:+918829026003" className="flex items-center gap-3 bg-white px-5 py-3 rounded-full text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition">
                                    <HiOutlinePhone className="text-lg text-gray-800" /> +91 88290 26003
                                </a>
                                <a href="mailto:support@furrmaa.in" className="flex items-center gap-3 bg-white px-5 py-3 rounded-full text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition">
                                    <HiOutlineMail className="text-lg text-gray-800" /> support@furrmaa.in
                                </a>
                            </div>
                        </div>

                        {/* Partnership Card */}
                        <div className="p-8 rounded-[24px] space-y-6 shadow-sm border border-blue-50
    bg-[linear-gradient(180deg,#F3F8FF_0%,#C0DBFF_100%)]">
                            <h3 className="text-lg font-bold text-black">Partnerships & Business Enquiries</h3>
                            <p className="text-sm text-gray-700">For veterinary clinics, pet shops, hostels, groomers, trainers, NGOs, and service providers</p>
                            <div className="space-y-3">
                                <a href="tel:+918829026003" className="flex items-center gap-3 bg-white px-5 py-3 rounded-full text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition">
                                    <HiOutlinePhone className="text-lg text-gray-800" /> +91 88290 26003
                                </a>
                                <a href="mailto:partnerships@furrmaa.in" className="flex items-center gap-3 bg-white px-5 py-3 rounded-full text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition">
                                    <HiOutlineMail className="text-lg text-gray-800" /> partnerships@furrmaa.in
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                        <div className="text-center mb-10">
                            <h2 className="text-xl font-bold text-black mb-2">Contact Form</h2>
                            <p className="text-gray-500">Fill out the form below and our team will get back to you shortly.</p>
                        </div>

                        {submitted ? (
                            <div className="text-center py-6">
                                <div className="inline-block p-4 bg-green-100 rounded-full mb-2">
                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                                <p className="text-gray-600">We'll get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Enter your Full Name"
                                        onChange={handleChange}
                                        className="w-full px-5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[14px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Mobile Number / WhatsApp Number</label>
                                    <input
                                        type="text"
                                        name="mobileNumber"
                                        placeholder="Enter Mobile Number / WhatsApp Number"
                                        onChange={handleChange}
                                        className="w-full px-5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[14px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your Email Address"
                                    onChange={handleChange}
                                    className="w-full px-5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[14px]"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700 ml-1">I am a:</label>
                                <div className="flex flex-wrap gap-3">
                                    {userTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all
                                                ${formData.userType === type
                                                    ? 'bg-[#1e293b] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    rows="3"
                                    placeholder="Write your message..."
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-200 text-[15px] resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isFormIncomplete || submitting}
                                    className={`px-12 py-3.5 rounded-full font-bold text-white transition-all flex items-center gap-2
                                        ${isFormIncomplete || submitting
                                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                            : 'bg-[#1e293b] hover:bg-[#0f172a] shadow-lg active:scale-95'}`}
                                >
                                    {submitting ? 'Sending...' : 'Send ➔'}
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-20 text-center space-y-2">
                    <p className="text-lg font-bold text-black ">We Care Because They Do</p>
                    <p className="text-lg text-gray-800 font-medium">
                        <span className="font-bold text-black"> At FURRMAA</span>, every message matters because behind every query is a pet that deserves care, attention, and trust.
                    </p>
                </div>
            </Container>
            <WhyChooseFurrmaa/>
        </section>
    );
};

export default ContactUs;