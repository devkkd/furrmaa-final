"use client";
import React, { useState } from 'react';
import Container from '@/components/Container';
import { submitSupportRequest } from '@/lib/api';
import { HiOutlineMail, HiOutlinePhone, HiOutlineSupport, HiCheckCircle } from 'react-icons/hi';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await submitSupportRequest({
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ subject: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white h-full w-full">
      <Container>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-[1000px] shadow-sm">
          <h1 className="text-[28px] font-bold text-black mb-8">Support</h1>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            
            {/* Left Column: Form Area */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1">How can we help?</h2>
                <p className="text-[14px] text-gray-500">
                  Send us a message and we'll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
                  <HiCheckCircle className="text-5xl text-green-500 mb-4" />
                  <p className="text-green-800 text-lg font-bold mb-2">Request Submitted!</p>
                  <p className="text-green-600 text-sm">We've received your message and will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-gray-700">Subject</label>
                    <input
                      type="text"
                      placeholder="Briefly describe your issue"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-[14px] placeholder-gray-400"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] text-gray-700">Message</label>
                    <textarea
                      placeholder="Please provide as much detail as possible..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        setError('');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-[14px] placeholder-gray-400 min-h-[160px] resize-y"
                      required
                      disabled={submitting}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-[13px] font-medium text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#0E1116] text-white text-sm font-medium px-8 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors w-full sm:w-auto"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Contact Information */}
            <div className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-10">
              <h2 className="text-[17px] font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                
                {/* Email Info */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                    <HiOutlineMail className="text-xl text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">Email Us</h4>
                    <p className="text-[14px] text-gray-500">support@furrmaa.com</p>
                  </div>
                </div>

                {/* Phone Info */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                    <HiOutlinePhone className="text-xl text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">Call Us</h4>
                    <p className="text-[14px] text-gray-500">+91 1234567890</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Mon-Fri, 9am to 6pm</p>
                  </div>
                </div>

                {/* Support Center Info */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                    <HiOutlineSupport className="text-xl text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">Help Center</h4>
                    <p className="text-[14px] text-gray-500 line-clamp-2 leading-relaxed">
                      Check our FAQ page for quick answers to common questions.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}