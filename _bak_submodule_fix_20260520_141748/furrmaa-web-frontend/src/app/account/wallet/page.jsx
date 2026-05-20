'use client';

import { useCallback, useEffect, useState } from 'react';
import Container from '@/components/Container';
import {
  fetchWallet,
  createWalletPaymentOrder,
  verifyWalletPayment,
  withdrawFromWallet,
  loadRazorpayScript,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const PRESETS = [100, 250, 500, 1000, 2000];

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('500');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWallet();
      setBalance(data.balance);
      setTransactions(data.transactions || []);
    } catch (e) {
      setError(e.message || 'Could not load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleRecharge = async () => {
    const amt = Number(String(amount).replace(/\D/g, '')) || 0;
    if (amt < 1) {
      setError('Enter a valid amount (min ₹1)');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Unable to load payment gateway');
      const init = await createWalletPaymentOrder(amt);
      await new Promise((resolve, reject) => {
        const options = {
          key: init.keyId,
          amount: init.razorpayOrder?.amount,
          currency: init.razorpayOrder?.currency || 'INR',
          name: 'Furrmaa',
          description: 'Wallet recharge',
          order_id: init.razorpayOrder?.id,
          prefill: { name: user?.name || '', email: user?.email || '' },
          theme: { color: '#1F2E46' },
          handler: async (response) => {
            try {
              await verifyWalletPayment({ ...response, amount: amt });
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
      setRechargeOpen(false);
      setMessage(`₹${amt} added to your wallet`);
      await load();
    } catch (e) {
      if (e.message !== 'Payment cancelled') setError(e.message || 'Recharge failed');
    } finally {
      setBusy(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(String(amount).replace(/\D/g, '')) || 0;
    if (amt < 1) {
      setError('Enter a valid amount');
      return;
    }
    if (amt > balance) {
      setError('Amount exceeds available balance');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await withdrawFromWallet(amt, withdrawNote.trim() || undefined);
      setWithdrawOpen(false);
      setAmount('');
      setWithdrawNote('');
      setMessage('Withdrawal request submitted');
      await load();
    } catch (e) {
      setError(e.message || 'Withdraw failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white h-full w-full pb-24 md:pb-10">
      <Container>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 w-full max-w-[900px] shadow-sm">
          <h1 className="text-[28px] font-bold text-black mb-2">My Wallet</h1>
          <p className="text-gray-500 text-sm mb-6">Recharge, pay for orders and subscriptions</p>

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

          <div className="rounded-2xl bg-[#1F2E46] text-white p-6 mb-6">
            <p className="text-sm opacity-80 mb-1">Available balance</p>
            {loading ? (
              <div className="h-10 w-32 bg-white/20 animate-pulse rounded" />
            ) : (
              <p className="text-4xl font-extrabold">₹{balance.toLocaleString('en-IN')}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setRechargeOpen(true);
                }}
                className="bg-[#95E562] text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:opacity-90"
              >
                Recharge
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setWithdrawOpen(true);
                }}
                className="border border-white/40 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-white/10"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {['all', 'credit', 'debit'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  filter === f ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          <h2 className="font-bold text-gray-900 mb-3">Transaction history</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-6">No transactions yet</p>
          ) : (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto">
              {filtered.map((tx) => (
                <li
                  key={tx._id || `${tx.createdAt}-${tx.amount}`}
                  className="flex justify-between items-start border border-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {tx.description || (tx.type === 'credit' ? 'Credit' : 'Debit')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '−'}₹
                    {Number(tx.amount || 0).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      {rechargeOpen && (
        <WalletModal title="Recharge wallet" onClose={() => setRechargeOpen(false)}>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  amount === String(p) ? 'border-[#1F2E46] bg-[#F4F7FF]' : 'border-gray-200'
                }`}
              >
                ₹{p}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-4"
            placeholder="Amount"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleRecharge}
            className="w-full bg-[#1F2E46] text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {busy ? 'Processing…' : 'Pay with Razorpay'}
          </button>
        </WalletModal>
      )}

      {withdrawOpen && (
        <WalletModal title="Withdraw" onClose={() => setWithdrawOpen(false)}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-3"
            placeholder="Amount"
          />
          <input
            type="text"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-4"
            placeholder="Note (optional)"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleWithdraw}
            className="w-full bg-[#1F2E46] text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {busy ? 'Submitting…' : 'Request withdrawal'}
          </button>
        </WalletModal>
      )}
    </section>
  );
}

function WalletModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
