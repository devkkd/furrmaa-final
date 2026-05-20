"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { HiCheckCircle } from 'react-icons/hi';
import { fetchSubscription, purchaseTrainingSubscription, verifyTrainingSubscriptionPayment, loadRazorpayScript, payTrainingSubscriptionWithWallet } from '@/lib/api';

const SubscriptionPage = () => {
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');

    // Static feature data from the UI reference
    const features = [
        "Smart Training Modules",
        "Multiple Pet Profiles",
        "50+ Expert-Led Lessons & Videos",
        "Beginner to Advanced Skill Progression",
        "Track Learning Progress",
        "Bookmark & Continue Watching"
    ];

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchSubscription()
            .then((data) => {
                if (!cancelled) {
                    setSubscription(data.subscription);
                }
            })
            .catch(() => {
                if (!cancelled) setSubscription(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const hasTrainingAccess = subscription?.plan === 'training' || subscription?.plan === 'premium' || subscription?.planType === 'training';

    const handlePurchase = async () => {
        setShowPaymentModal(true);
    };

    const handleConfirmPurchase = async () => {
        setPurchasing(true);
        setError('');
        
        try {
            if (paymentMethod === 'wallet') {
                await payTrainingSubscriptionWithWallet(999);
                const subData = await fetchSubscription();
                setSubscription(subData.subscription);
                setShowPaymentModal(false);
                setTimeout(() => router.push('/training'), 1500);
                return;
            }
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) throw new Error('Unable to load Razorpay checkout. Please try again.');
            const paymentInit = await purchaseTrainingSubscription({
                paymentMethod,
                plan: 'training',
                amount: 999,
            });
            await new Promise((resolve, reject) => {
                const options = {
                    key: paymentInit.keyId,
                    amount: paymentInit.razorpayOrder?.amount,
                    currency: paymentInit.razorpayOrder?.currency || 'INR',
                    name: 'Furrmaa',
                    description: 'Training subscription',
                    order_id: paymentInit.razorpayOrder?.id,
                    theme: { color: '#1e293b' },
                    handler: async (response) => {
                        try {
                            await verifyTrainingSubscriptionPayment({
                                ...response,
                                plan: 'training',
                                amount: 999,
                                paymentMethod: 'razorpay',
                            });
                            resolve(true);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled by user')),
                    },
                };
                const rp = new window.Razorpay(options);
                rp.open();
            });
            // Refresh subscription status
            const data = await fetchSubscription();
            setSubscription(data.subscription);
            setShowPaymentModal(false);
            // Redirect to training page after successful purchase
            setTimeout(() => {
                router.push('/training');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Purchase failed. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <section className="bg-white py-8 md:py-8 min-h-screen">
            <Container>
                <div className="max-w-7xl mx-auto px-6 md:px-9">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                        
                        {/* Left Side: Content & Hero Image */}
                        <div className="flex-1">
                            <div className="space-y-4">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
                                    Unlock All Intermediate & <br /> Advanced Training Videos 🐾🎓
                                </h2>
                                <p className="md:text-xl text-gray-800 font-medium">
                                    Get full access to every lesson and boost your pet's training journey.
                                </p>
                            </div>

                            {/* Hero Image */}
                            <div className=" absolute left-55 md:left-0 md:relative max-w-md mx-auto lg:mx-0 pt-3">
                                <img 
                                    src="/images/CardTwo/inter.png" 
                                    alt="Jumping Puppy Training" 
                                    className="w-[75%] md:w-[70%] h-auto object-contain transform -rotate-12 md:-rotate-6 hover:rotate-0 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Right Side: Pricing Card */}
                        <div className="w-full lg:w-[450px]">
                            <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-blue-50/50">
                                {/* Trial Badge */}
                                <div className="mb-8">
                                    <span className="bg-[#a3e635] text-black text-sm font-bold px-6 py-2.5 rounded-full shadow-sm">
                                        3-Day Free Trial
                                    </span>
                                </div>

                                {/* Feature List */}
                                <div className="space-y-6 mb-10">
                                    <h3 className="text-2xl font-extrabold text-black">What You Get</h3>
                                    <ul className="space-y-4">
                                        {features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-3 group">
                                                <HiCheckCircle className="text-[#a3e635] text-2xl shrink-0" />
                                                <span className="text-gray-800 font-bold text-[15px]">
                                                    {feature} {feature === "Track Learning Progress" && "✓"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Subscription Status */}
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Checking subscription...</div>
                                ) : hasTrainingAccess ? (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-[32px] p-6 md:p-8 text-center space-y-3 mb-8">
                                        <div className="inline-block p-3 bg-green-100 rounded-full mb-2">
                                            <HiCheckCircle className="text-green-600 text-3xl" />
                                        </div>
                                        <h4 className="text-xl font-extrabold text-green-800">You Have Access!</h4>
                                        <p className="text-sm font-bold text-green-700">
                                            Enjoy unlimited access to all training videos
                                        </p>
                                        <button
                                            onClick={() => router.push('/training')}
                                            className="mt-4 w-full bg-green-600 text-white py-3 rounded-full font-bold text-sm shadow-lg hover:bg-green-700 transition-all"
                                        >
                                            Go to Training ➔
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Price Box */}
                                        <div className="bg-[#a3e635] rounded-[32px] p-4 md:p-8 text-center space-y-2 mb-8 shadow-inner">
                                            <h4 className="text-3xl font-extrabold text-black">Only ₹999</h4>
                                            <p className="text-[13px] font-bold text-black/80">
                                                (One-Time Access)
                                            </p>
                                            <p className="text-[11px] font-bold text-black/60 leading-tight">
                                                No hidden fees. Lifetime access to all premium
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}

                                        {/* CTA Button */}
                                        <button
                                            onClick={handlePurchase}
                                            disabled={purchasing}
                                            className="w-full bg-[#1e293b] text-white py-4 rounded-full font-bold text-sm shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {purchasing ? 'Processing...' : 'Continue to Free Trial ➔'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </Container>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50" 
                        onClick={() => !purchasing && setShowPaymentModal(false)}
                    />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
                        
                        <div className="space-y-3 mb-6">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
                                />
                                <span className="text-sm font-medium text-gray-700">UPI</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
                                />
                                <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="wallet"
                                    checked={paymentMethod === 'wallet'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
                                />
                                <span className="text-sm font-medium text-gray-700">Wallet</span>
                            </label>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Total Amount</span>
                                <span className="text-xl font-extrabold text-gray-900">₹999</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={purchasing}
                                className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPurchase}
                                disabled={purchasing}
                                className="flex-1 py-3 rounded-xl bg-[#1e293b] font-bold text-white hover:bg-black disabled:opacity-50"
                            >
                                {purchasing ? 'Processing...' : 'Pay ₹999'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default SubscriptionPage;