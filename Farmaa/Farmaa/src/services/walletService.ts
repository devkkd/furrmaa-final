import api from '../config/api';
import {
  payForWalletRecharge,
  isPaymentCancelledError,
} from './razorpayPayment';

export type WalletTransaction = {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status?: string;
  paymentMethod?: string;
  createdAt?: string;
  date: string;
  order?: {
    _id?: string;
    orderNumber?: string;
    totalAmount?: number;
  } | null;
};

export type WalletData = {
  balance: number;
  transactions: WalletTransaction[];
};

function mapTransaction(t: any): WalletTransaction {
  const order =
    t.order && typeof t.order === 'object'
      ? {
          _id: t.order._id,
          orderNumber: t.order.orderNumber,
          totalAmount: t.order.totalAmount,
        }
      : null;

  return {
    _id: t._id || `${t.createdAt}-${t.type}-${t.amount}`,
    type: t.type,
    amount: t.amount,
    description: t.description || (t.type === 'credit' ? 'Credit' : 'Debit'),
    status: t.status,
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt,
    date: t.createdAt
      ? new Date(t.createdAt).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
    order,
  };
}

export async function fetchWallet(): Promise<WalletData> {
  const res = await api.CLIENT.get(api.ENDPOINTS.WALLET);
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to load wallet');
  }
  return {
    balance: res.data.balance ?? 0,
    transactions: (res.data.transactions || []).map(mapTransaction),
  };
}

export async function fetchWalletBalance(): Promise<number> {
  const res = await api.CLIENT.get(api.ENDPOINTS.WALLET_BALANCE);
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to load balance');
  }
  return res.data.balance ?? 0;
}

export async function withdrawFromWallet(amount: number, note?: string) {
  const res = await api.CLIENT.post(api.ENDPOINTS.WALLET_WITHDRAW, {
    amount,
    note: note?.trim() || undefined,
  });
  return res.data;
}

export async function rechargeWallet(
  amount: number,
  prefill?: { name?: string; email?: string; contact?: string }
) {
  return payForWalletRecharge(amount, prefill);
}

export async function paySubscriptionWithWallet(plan: string, amount: number) {
  const res = await api.CLIENT.post(`${api.ENDPOINTS.SUBSCRIPTION}/pay-with-wallet`, {
    plan,
    amount,
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Wallet payment failed');
  }
  return res.data;
}

export { isPaymentCancelledError };
