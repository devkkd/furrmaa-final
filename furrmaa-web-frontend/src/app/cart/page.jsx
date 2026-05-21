'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Container from '@/components/Container';
import CouponInput, { getStoredCoupon } from '@/components/CouponInput';
import { fetchAddresses, getToken } from '@/lib/api';
import { syncCartFromServer, updateCartQuantity, removeProductFromCart } from '@/lib/cartActions';

// Placeholder image to avoid 404 (no local /images/products/p1.png)
const PLACEHOLDER_IMG = 'https://placehold.co/80x80/e5e7eb/6b7280?text=Pet';

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useCartStore((s) => s.items);
  const [coupon, setCoupon] = useState(() => getStoredCoupon());
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const loadAddress = useCallback(async () => {
    setLoadingAddress(true);
    try {
      const addresses = await fetchAddresses();
      const selectedId = typeof window !== 'undefined' ? localStorage.getItem('selectedAddressId') : null;
      if (addresses.length > 0) {
        const chosen = selectedId
          ? addresses.find((a) => a._id === selectedId) || addresses.find((a) => a.isDefault) || addresses[0]
          : addresses.find((a) => a.isDefault) || addresses[0];
        setAddress(chosen);
      } else {
        setAddress(null);
      }
    } catch (_) {
      setAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  useEffect(() => {
    if (getToken()) syncCartFromServer();
  }, []);

  const isOrderPlaced = searchParams.get('placed') === '1';

  const subtotal = items.reduce((sum, i) => {
    const price = i.product?.price ?? 0;
    return sum + price * (i.qty || 1);
  }, 0);

  // Calculate discount (if product has oldPrice, calculate discount)
  const discount = items.reduce((sum, i) => {
    const oldPrice = i.product?.oldPrice ?? 0;
    const currentPrice = i.product?.price ?? 0;
    if (oldPrice > currentPrice) {
      return sum + (oldPrice - currentPrice) * (i.qty || 1);
    }
    return sum;
  }, 0);

  const couponDiscount = coupon?.discountAmount || 0;
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - discount - couponDiscount + deliveryFee);

  const handleCheckout = () => {
    // Navigate to checkout page or process order
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <Container>
          <div className="text-center">
            {isOrderPlaced ? (
              <>
                <h1 className="text-2xl font-bold text-green-700 mb-2">Order placed successfully</h1>
                <p className="text-gray-600 mb-6">Thank you for your order.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
                <p className="text-gray-600 mb-6">Add items from the shop to get started.</p>
              </>
            )}
            <Link
              href="/shop"
              className="inline-block bg-[#1F2E46] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white min-h-screen">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart</h1>

        {/* Delivery Address - same as before (Farmaa design) */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {loadingAddress ? (
                <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
              ) : address ? (
                <>
                  <p className="font-semibold text-gray-900 mb-1">
                    Deliver to: {address.name}, {address.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-900 mb-1">No address selected</p>
                  <p className="text-sm text-gray-600">Please add an address to continue</p>
                </>
              )}
            </div>
            <Link
              href="/addresses"
              className="shrink-0 bg-[#95E562] hover:bg-[#85d552] text-black font-semibold px-4 py-2.5 rounded-full transition"
            >
              {address ? 'Change' : 'Add'}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-7">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cart Items</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm"
                >
                  <img
                    src={item.product?.image || PLACEHOLDER_IMG}
                    alt={item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{item.product?.name || `Product ${item.productId}`}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      ₹{(item.product?.price ?? 0).toLocaleString('en-IN')} × {item.qty}
                    </p>
                    {item.product?.oldPrice && item.product.oldPrice > item.product.price && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{(item.product.oldPrice * item.qty).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, Math.max(1, item.qty - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, item.qty + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProductFromCart(item.productId)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Link
              href="/shop"
              className="inline-block text-[#1F2E46] font-semibold hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <CouponInput subtotal={subtotal - discount} onApplied={setCoupon} />
            <CheckoutCard
              subtotal={subtotal}
              discount={discount}
              couponDiscount={couponDiscount}
              deliveryFee={deliveryFee}
              total={total}
              itemCount={items.reduce((sum, i) => sum + (i.qty || 1), 0)}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <Container>
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </Container>
      </section>
    }>
      <CartContent />
    </Suspense>
  );
}

/* Checkout Card Component */
function CheckoutCard({ subtotal, discount, couponDiscount = 0, deliveryFee, total, itemCount, paymentMethod, onPaymentMethodChange, onCheckout }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm sticky top-4">
      {/* Price Details Header */}
      <div className="p-5 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-900">Price Details</h3>
      </div>

      {/* Price Breakdown */}
      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Product discount</span>
            <span className="text-green-600 font-bold">-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Coupon</span>
            <span className="text-green-600 font-bold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-bold text-gray-900">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toLocaleString('en-IN')}`}</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">Total Amount</span>
          <span className="font-extrabold text-xl text-gray-900">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="p-5 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Payment Method</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
            />
            <span className="text-sm font-medium text-gray-700">UPI</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
            />
            <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4 text-[#1F2E46] border-gray-300 focus:ring-[#1F2E46]"
            />
            <span className="text-sm font-medium text-gray-700">Cash on Delivery</span>
          </label>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={onCheckout}
          className="w-full bg-[#1F2E46] text-white font-bold py-3.5 px-6 rounded-lg hover:opacity-90 transition shadow-sm"
        >
          Proceed to Checkout
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          You will be redirected to complete your order
        </p>
      </div>
    </div>
  );
}
