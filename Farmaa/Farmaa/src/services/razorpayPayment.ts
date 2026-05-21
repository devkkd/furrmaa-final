import RazorpayCheckout from 'react-native-razorpay';
import api from '../config/api';

type RazorpayOpenResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export async function openRazorpayCheckout(options: {
  keyId: string;
  amount: number;
  orderId: string;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; contact?: string; name?: string };
}): Promise<RazorpayOpenResult> {
  return RazorpayCheckout.open({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency || 'INR',
    order_id: options.orderId,
    name: options.name || 'Furrmaa',
    description: options.description || 'Payment',
    prefill: options.prefill || {},
    theme: { color: '#1E3A8A' },
  }) as Promise<RazorpayOpenResult>;
}

export async function createCheckoutPaymentOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
) {
  const res = await api.CLIENT.post(api.ENDPOINTS.ORDERS_CREATE_PAYMENT, {
    amount,
    currency: 'INR',
    receipt,
    notes,
  });
  return res.data;
}

export async function verifyCheckoutPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderData: Record<string, unknown>;
}) {
  const res = await api.CLIENT.post(api.ENDPOINTS.ORDERS_VERIFY_PAYMENT, payload);
  return res.data;
}

export async function createSubscriptionPaymentOrder(
  plan: string,
  amount: number
) {
  const res = await api.CLIENT.post(
    `${api.ENDPOINTS.SUBSCRIPTION}/create-payment-order`,
    { plan, amount, currency: 'INR' }
  );
  return res.data;
}

export async function verifySubscriptionPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: string;
  amount: number;
  paymentMethod?: string;
}) {
  const res = await api.CLIENT.post(
    `${api.ENDPOINTS.SUBSCRIPTION}/verify-payment`,
    payload
  );
  return res.data;
}

export const SUBSCRIPTION_PLAN_AMOUNTS: Record<string, number> = {
  free: 0,
  basic: 299,
  premium: 599,
  premium_plus: 999,
  training: 999,
};

export function planKeyFromDisplayName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

export async function payForSubscriptionPlan(
  plan: string,
  amount: number,
  prefill?: { email?: string; contact?: string; name?: string }
) {
  const paymentInit = await createSubscriptionPaymentOrder(plan, amount);
  const rpOrder = paymentInit.razorpayOrder;
  if (!paymentInit.keyId || !rpOrder?.id || !rpOrder?.amount) {
    throw new Error(paymentInit.message || 'Failed to start payment');
  }
  const paymentResult = await openRazorpayCheckout({
    keyId: paymentInit.keyId,
    amount: rpOrder.amount,
    orderId: rpOrder.id,
    currency: rpOrder.currency || 'INR',
    description: `${plan} subscription`,
    prefill,
  });
  await verifySubscriptionPayment({
    razorpay_order_id: paymentResult.razorpay_order_id,
    razorpay_payment_id: paymentResult.razorpay_payment_id,
    razorpay_signature: paymentResult.razorpay_signature,
    plan,
    amount,
    paymentMethod: 'razorpay',
  });
}

export async function createWalletPaymentOrder(amount: number) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.WALLET}/create-payment-order`, {
    amount,
    currency: 'INR',
  });
  return res.data;
}

export async function verifyWalletPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
}) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.WALLET}/verify-payment`, payload);
  return res.data;
}

export async function payForWalletRecharge(
  amount: number,
  prefill?: { email?: string; contact?: string; name?: string }
) {
  const paymentInit = await createWalletPaymentOrder(amount);
  const rpOrder = paymentInit.razorpayOrder;
  if (!paymentInit.keyId || !rpOrder?.id || !rpOrder?.amount) {
    throw new Error(paymentInit.message || 'Failed to start wallet payment');
  }
  const paymentResult = await openRazorpayCheckout({
    keyId: paymentInit.keyId,
    amount: rpOrder.amount,
    orderId: rpOrder.id,
    currency: rpOrder.currency || 'INR',
    description: 'Wallet recharge',
    prefill,
  });
  return verifyWalletPayment({
    razorpay_order_id: paymentResult.razorpay_order_id,
    razorpay_payment_id: paymentResult.razorpay_payment_id,
    razorpay_signature: paymentResult.razorpay_signature,
    amount,
  });
}

export function isPaymentCancelledError(error: unknown): boolean {
  const e = error as { code?: number; description?: string };
  return e?.code === 0 || e?.code === 2;
}
