'use client';

import { useState } from 'react';
import { validateCoupon } from '@/lib/api';

const COUPON_STORAGE_KEY = 'furrmaa_coupon';

export function getStoredCoupon() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredCoupon(coupon) {
  if (typeof window === 'undefined') return;
  if (!coupon) sessionStorage.removeItem(COUPON_STORAGE_KEY);
  else sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
}

export default function CouponInput({ subtotal, onApplied, className = '' }) {
  const [code, setCode] = useState(() => getStoredCoupon()?.code || '');
  const [applied, setApplied] = useState(() => getStoredCoupon());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter a coupon code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const coupon = await validateCoupon(trimmed, subtotal);
      const payload = {
        code: coupon.code || trimmed,
        discountAmount: coupon.discountAmount ?? 0,
      };
      setApplied(payload);
      setStoredCoupon(payload);
      onApplied?.(payload);
    } catch (e) {
      setApplied(null);
      setStoredCoupon(null);
      onApplied?.(null);
      setError(e.message || 'Invalid coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setStoredCoupon(null);
    onApplied?.(null);
    setError('');
  };

  return (
    <div className={`rounded-2xl border border-gray-100 bg-gray-50 p-4 ${className}`}>
      <h4 className="text-sm font-bold text-gray-900 mb-3">Coupon code</h4>
      {applied ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-green-700 font-medium">
            {applied.code} applied (−₹{Number(applied.discountAmount || 0).toLocaleString('en-IN')})
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1F2E46]"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="shrink-0 bg-[#1F2E46] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Apply'}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
