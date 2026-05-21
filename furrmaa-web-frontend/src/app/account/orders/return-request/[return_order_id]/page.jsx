'use client';

import React, { useState, useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/Container';
import ProductInfoCard from '@/components/ProductInfoCard';
import { fetchOrderById, submitReturnRequest } from '@/lib/api';

const ReturnOrderPage = () => {
    const { return_order_id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!return_order_id) return;
        let cancelled = false;
        setLoading(true);
        fetchOrderById(return_order_id)
            .then((data) => {
                if (!cancelled) {
                    setOrder(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setOrder(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [return_order_id]);

    if (loading) {
        return (
            <section className="bg-white min-h-screen py-6 md:py-10">
                <Container>
                    <div className="p-10 text-center text-gray-500">Loading order details...</div>
                </Container>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="bg-white min-h-screen py-6 md:py-10">
                <Container>
                    <div className="p-10 text-center">
                        <p className="text-gray-700 mb-4">Order not found.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-[#1F2E46] font-medium hover:underline"
                        >
                            ← Go Back
                        </button>
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <section className="bg-white min-h-screen py-6 md:py-10">
            <Container>
                {/* Navigation Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-all">
                        <HiArrowLeft className="text-2xl text-gray-800" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-900">Return Order</h1>
                </div>

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* First Grid: Product Details (Uses your existing component) */}
                    <div className="lg:col-span-4">
                        <ProductInfoCard order={order} />
                    </div>

                    {/* Second Grid: Return Reasons */}
                    <div className="lg:col-span-5">
                        <ReturnReasonCard orderId={return_order_id} />
                    </div>

                </div>
            </Container>
        </section>
    );
};

const ReturnReasonCard = ({ orderId }) => {
    const router = useRouter();
    const [selectedReason, setSelectedReason] = useState('damaged');
    const [otherReason, setOtherReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const reasons = [
        { id: 'damaged', label: 'Received a damaged product' },
        { id: 'wrong', label: 'Wrong item delivered' },
        { id: 'missing', label: 'Missing parts or accessories' },
        { id: 'quality', label: 'Poor quality or defective' },
        { id: 'not-described', label: 'Not as described' },
        { id: 'other', label: 'Other (write your reason)' },
    ];

    const handleSubmit = async () => {
        if (selectedReason === 'other' && !otherReason.trim()) {
            setError('Please provide a reason');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await submitReturnRequest(orderId, {
                reason: selectedReason === 'other' ? otherReason.trim() : selectedReason,
                description: selectedReason === 'other' ? otherReason.trim() : reasons.find(r => r.id === selectedReason)?.label,
            });
            setSubmitted(true);
            setTimeout(() => {
                router.push('/account/orders');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit return request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
                <div className="text-center py-12">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Return Request Submitted!</h3>
                    <p className="text-gray-600 mb-4">We'll process your return request shortly.</p>
                    <p className="text-sm text-gray-500">Redirecting to orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-8 ml-1">Select Return Reason</h3>

            <div className="space-y-6 mb-10">
                {reasons.map((reason) => (
                    <label key={reason.id} className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="radio"
                                name="returnReason"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:border-[#1a2b48] transition-all"
                                checked={selectedReason === reason.id}
                                onChange={() => {
                                    setSelectedReason(reason.id);
                                    setError('');
                                }}
                                disabled={submitting}
                            />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-[#1a2b48] opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[15px] text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                            {reason.label}
                        </span>
                    </label>
                ))}
            </div>

            {selectedReason === 'other' && (
                <div className="mb-6">
                    <textarea
                        value={otherReason}
                        onChange={(e) => {
                            setOtherReason(e.target.value);
                            setError('');
                        }}
                        placeholder="Please describe your reason..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                        rows={3}
                        disabled={submitting}
                    />
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || (selectedReason === 'other' && !otherReason.trim())}
                    className="bg-[#1a2b48] hover:bg-[#0f1a2e] text-white font-bold py-4 px-12 rounded-full flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit ➔'}
                </button>
            </div>
        </div>
    );
};

export default ReturnOrderPage;