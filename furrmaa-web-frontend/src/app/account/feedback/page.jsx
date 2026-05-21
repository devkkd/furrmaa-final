"use client"
import React, { useState } from 'react';
import { submitFeedback } from '@/lib/api';

const ShareFeedback = () => {
    // State management for form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        feedbackType: 'Bug Report',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Types of feedback available
    const feedbackTypes = ["Bug Report", "Feature Request", "App Experience"];

    // Validation logic: Button is disabled if name, email, or message is empty
    const isFormEmpty = !formData.name.trim() || !formData.email.trim() || !formData.message.trim();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormEmpty) return;

        setSubmitting(true);
        setError('');

        try {
            await submitFeedback({
                name: formData.name.trim(),
                email: formData.email.trim(),
                feedbackType: formData.feedbackType,
                message: formData.message.trim(),
            });
            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                feedbackType: 'Bug Report',
                message: ''
            });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 md:rounded-[32px] p-8 md:p-12 shadow-sm min-h-[600px] w-full max-w-[1000px]">
            {/* Header */}
            <h1 className="text-2xl md:text-[28px] font-bold text-black mb-8">Share Feedback</h1>

            {submitted ? (
                /* Success Confirmation State */
                <div className="flex items-start gap-4 mt-2">
                    <div className="w-[42px] h-[42px] bg-[#95E562] rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="pt-0.5">
                        <h3 className="text-[15px] font-bold text-black mb-1">Thank you for your feedback.</h3>
                        <p className="text-[14px] text-gray-600">Our team will review it and continue improving the Furrmaa experience.</p>
                    </div>
                </div>
            ) : (
                /* Form State */
                <>
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Help us improve your experience</h2>
                        <p className="text-gray-500 text-sm max-w-3xl leading-relaxed">
                            We value your input. Share your thoughts, report an issue, or suggest new features 
                            to help us make Furrmaa better for you and your pets.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name and Email Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full px-5 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[15px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full px-5 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Feedback Type Selector */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700 ml-1">Feedback Type</label>
                            <div className="flex flex-wrap gap-3">
                                {feedbackTypes.map((type) => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setFormData(prev => ({ ...prev, feedbackType: type }))}
                                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all
                                            ${formData.feedbackType === type 
                                                ? 'bg-[#1e293b] text-white shadow-md' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Message Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Your Feedback</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Tell us what happened or how we can improve..."
                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-200 text-[15px] resize-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isFormEmpty || submitting}
                                className={`px-12 py-4 rounded-full font-bold text-white transition-all flex items-center gap-2
                                    ${isFormEmpty || submitting
                                        ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                                        : 'bg-[#1e293b] hover:bg-[#0f172a] shadow-lg active:scale-95'}`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Feedback ➔'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ShareFeedback;