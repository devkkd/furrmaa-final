'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/Container';
import {
  fetchSubscription,
  upgradeSubscription,
  purchaseSubscriptionPlan,
  verifyTrainingSubscriptionPayment,
  paySubscriptionWithWallet,
  updateSubscription,
  loadRazorpayScript,
  SUBSCRIPTION_PLAN_AMOUNTS,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const PLANS = [
  {
    planKey: 'free',
    name: 'Free',
    price: '₹0',
    features: ['Basic features', 'Limited products', 'Community support'],
  },
  {
    planKey: 'basic',
    name: 'Basic',
    price: '₹299/month',
    features: ['All features', 'Unlimited products', 'Priority support'],
  },
  {
    planKey: 'premium',
    name: 'Premium',
    price: '₹599/month',
    features: ['All Basic features', 'AI Chatbot', 'Premium support', 'Exclusive deals'],
  },
  {
    planKey: 'premium_plus',
    name: 'Premium Plus',
    price: '₹999/month',
    features: ['All Premium features', '24/7 Support', 'VIP access'],
  },
];

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payModal, setPayModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSubscription();
      setSubscription(data.subscription);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runRazorpay = async (planKey, amount) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) throw new Error('Unable to load Razorpay');
    const paymentInit = await purchaseSubscriptionPlan({ plan: planKey, amount });
    await new Promise((resolve, reject) => {
      const options = {
        key: paymentInit.keyId,
        amount: paymentInit.razorpayOrder?.amount,
        currency: paymentInit.razorpayOrder?.currency || 'INR',
        name: 'Furrmaa',
        description: `${planKey} subscription`,
        order_id: paymentInit.razorpayOrder?.id,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#1F2E46' },
        handler: async (response) => {
          try {
            await verifyTrainingSubscriptionPayment({
              ...response,
              plan: planKey,
              amount,
              paymentMethod: 'razorpay',
            });
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      };
      const rp = new window.Razorpay(options);
      rp.open();
    });
  };

  const confirmPaidPlan = async (method) => {
    if (!payModal) return;
    const { planKey, amount } = payModal;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (method === 'wallet') {
        await paySubscriptionWithWallet(planKey, amount);
      } else {
        await runRazorpay(planKey, amount);
      }
      setMessage(`Successfully subscribed to ${planKey} plan`);
      setPayModal(null);
      await load();
    } catch (e) {
      if (e.message !== 'Payment cancelled') setError(e.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    const amount = SUBSCRIPTION_PLAN_AMOUNTS[plan.planKey] ?? 0;
    if (amount <= 0) {
      setBusy(true);
      setError('');
      try {
        await upgradeSubscription(plan.planKey);
        setMessage(`Switched to ${plan.name}`);
        await load();
      } catch (e) {
        setError(e.message || 'Failed to switch plan');
      } finally {
        setBusy(false);
      }
      return;
    }
    setPayModal({ planKey: plan.planKey, amount, name: plan.name });
  };

  const handleRenew = () => {
    if (!subscription) return;
    const amount = SUBSCRIPTION_PLAN_AMOUNTS[subscription.plan] ?? 0;
    if (amount <= 0) {
      setError('Free plan does not require renewal');
      return;
    }
    setPayModal({ planKey: subscription.plan, amount, name: subscription.plan });
  };

  const handleAutoRenew = async (value) => {
    setBusy(true);
    try {
      await updateSubscription({ autoRenew: value });
      setSubscription((s) => (s ? { ...s, autoRenew: value } : s));
      setMessage(`Auto-renew ${value ? 'enabled' : 'disabled'}`);
    } catch (e) {
      setError(e.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white h-full w-full pb-24 md:pb-10">
      <Container>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-[900px] shadow-sm">
          <h1 className="text-[28px] font-bold text-black mb-2">Subscription</h1>
          <p className="text-gray-500 text-sm mb-6">Manage your membership plan</p>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 py-8">Loading subscription…</p>
          ) : (
            <>
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1">Current plan</h2>
                <p className="text-[15px] text-gray-500 capitalize">{subscription?.plan || 'free'}</p>
                {subscription?.endDate && (
                  <p className="text-[13px] text-gray-400 mt-2">
                    Valid until: {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                )}
                {subscription?.plan && subscription.plan !== 'free' && (
                  <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <button
                      type="button"
                      onClick={handleRenew}
                      disabled={busy}
                      className="bg-[#1F2E46] text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Renew plan
                    </button>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(subscription.autoRenew)}
                        onChange={(e) => handleAutoRenew(e.target.checked)}
                        disabled={busy}
                      />
                      Auto-renew
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANS.map((plan) => {
                  const isCurrent = subscription?.plan === plan.planKey;
                  return (
                    <div
                      key={plan.planKey}
                      className={`border rounded-xl p-6 flex flex-col ${
                        isCurrent ? 'border-[#1F2E46] bg-[#F4F7FF]' : 'border-gray-200'
                      }`}
                    >
                      <h3 className="text-[17px] font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-[14px] text-gray-500 mb-3">{plan.price}</p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        disabled={busy || isCurrent}
                        onClick={() => handleSelectPlan(plan)}
                        className={`mt-auto text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-gray-200 text-gray-600 cursor-default'
                            : 'bg-[#1F2E46] text-white hover:opacity-90'
                        }`}
                      >
                        {isCurrent ? 'Current plan' : plan.planKey === 'free' ? 'Select free' : 'Subscribe'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Container>

      {payModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !busy && setPayModal(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Pay for {payModal.name}</h3>
            <p className="text-gray-600 text-sm mb-6">Amount: ₹{payModal.amount}</p>
            <div className="space-y-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmPaidPlan('wallet')}
                className="w-full border border-gray-200 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Pay with wallet
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmPaidPlan('razorpay')}
                className="w-full bg-[#1F2E46] text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                {busy ? 'Processing…' : 'Card / UPI (Razorpay)'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPayModal(null)}
                className="w-full text-gray-500 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
