'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Container from '@/components/Container';
import CouponInput, { getStoredCoupon, setStoredCoupon } from '@/components/CouponInput';
import {
  fetchAddresses,
  placeOrder,
  createCheckoutPaymentOrder,
  verifyCheckoutPayment,
  loadRazorpayScript,
  fetchWalletBalance,
} from '@/lib/api';
import { clearCartEverywhere, syncCartFromServer } from '@/lib/cartActions';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(() => getStoredCoupon());
  const [walletBalance, setWalletBalance] = useState(null);

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
    if (getToken()) {
      syncCartFromServer();
      fetchWalletBalance().then(setWalletBalance).catch(() => setWalletBalance(0));
    }
  }, [loadAddress]);

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * (i.qty || 1), 0);
  const discount = items.reduce((sum, i) => {
    const op = i.product?.oldPrice ?? 0;
    const p = i.product?.price ?? 0;
    return sum + (op > p ? (op - p) * (i.qty || 1) : 0);
  }, 0);
  const couponDiscount = coupon?.discountAmount || 0;
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - discount - couponDiscount + deliveryFee);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!address) {
      setError('Please add a delivery address.');
      return;
    }
    const token = getToken();
    if (!token) {
      setError('Please log in to place order.');
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const orderBody = {
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.qty || 1,
          price: i.product?.price ?? 0,
        })),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          phone: address.phone,
          name: address.name,
        },
        paymentMethod:
          paymentMethod === 'cash'
            ? 'cash'
            : paymentMethod === 'wallet'
              ? 'wallet'
              : paymentMethod === 'card'
                ? 'card'
                : 'upi',
        totalAmount: total,
        discount: discount + couponDiscount,
        deliveryFee,
        ...(coupon?.code ? { couponCode: coupon.code } : {}),
      };
      if (paymentMethod === 'wallet') {
        if ((walletBalance ?? 0) < total) {
          throw new Error('Insufficient wallet balance. Recharge from My Account → Wallet.');
        }
        await placeOrder(orderBody);
      } else if (paymentMethod === 'cash') {
        await placeOrder(orderBody);
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error('Unable to load Razorpay checkout. Please try again.');
        const paymentInit = await createCheckoutPaymentOrder({
          amount: total,
          receipt: `order_${Date.now()}`,
          notes: { source: 'web-checkout' },
        });
        await new Promise((resolve, reject) => {
          const options = {
            key: paymentInit.keyId,
            amount: paymentInit.razorpayOrder?.amount,
            currency: paymentInit.razorpayOrder?.currency || 'INR',
            name: 'Furrmaa',
            description: 'Product checkout payment',
            order_id: paymentInit.razorpayOrder?.id,
            prefill: {
              name: address?.name || '',
              contact: address?.phone || '',
            },
            notes: {
              address: `${address?.street || ''}, ${address?.city || ''}`,
            },
            theme: { color: '#1F2E46' },
            handler: async (response) => {
              try {
                await verifyCheckoutPayment({
                  ...response,
                  orderData: { ...orderBody, paymentMethod: 'razorpay' },
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
      }
      await clearCartEverywhere();
      setStoredCoupon(null);
      router.push('/cart?placed=1');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !loadingAddress) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add items from the shop before checkout.</p>
            <Link href="/shop" className="inline-block bg-[#1F2E46] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <h2 className="font-bold text-gray-900 mb-2">Delivery Address</h2>
              {loadingAddress ? (
                <div className="h-16 bg-gray-200 animate-pulse rounded" />
              ) : address ? (
                <p className="text-gray-700">
                  {address.name}, {address.phone}<br />
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </p>
              ) : (
                <p className="text-gray-600">No address selected. <Link href="/addresses" className="text-[#1F2E46] underline">Add address</Link></p>
              )}
              <Link href="/addresses" className="inline-block mt-2 text-[#1F2E46] font-medium text-sm">Change address</Link>
            </div>

            <CouponInput subtotal={subtotal - discount} onApplied={setCoupon} />

            <div className="p-4 border border-gray-100 rounded-2xl">
              <h2 className="font-bold text-gray-900 mb-3">Order summary</h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between text-sm">
                    <span>{item.product?.name || `Product ${item.productId}`} × {item.qty}</span>
                    <span>₹{((item.product?.price ?? 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm sticky top-4 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Payment</h3>
              <div className="space-y-2 mb-4">
                {['upi', 'card', 'wallet', 'cash'].map((pm) => (
                  <label key={pm} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm}
                      checked={paymentMethod === pm}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#1F2E46]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {pm === 'upi'
                        ? 'UPI'
                        : pm === 'card'
                          ? 'Credit/Debit Card'
                          : pm === 'wallet'
                            ? `Wallet${walletBalance != null ? ` (₹${walletBalance.toLocaleString('en-IN')})` : ''}`
                            : 'Cash on Delivery'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Product discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing || !address}
                className="w-full mt-6 bg-[#1F2E46] text-white font-bold py-3.5 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing order…' : 'Place Order'}
              </button>
              <Link href="/cart" className="block text-center text-sm text-gray-500 mt-3 hover:underline">Back to cart</Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
