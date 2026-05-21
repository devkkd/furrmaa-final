import express from 'express';
import crypto from 'crypto';
import { protect } from '../middleware/auth.middleware.js';
import Wallet from '../models/Wallet.model.js';
import {
  getRazorpay,
  hasRazorpayConfig,
  makeRazorpayReceipt,
  formatRazorpayError,
} from '../utils/razorpayClient.js';

const router = express.Router();

// Get user's wallet
router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }

    // Populate order references in transactions
    const transactions = await Wallet.findById(wallet._id)
      .populate('transactions.order', 'orderNumber totalAmount')
      .select('transactions')
      .lean();

    wallet.transactions = transactions?.transactions || [];

    res.json({
      success: true,
      balance: wallet.balance,
      transactions: wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Razorpay order for wallet recharge
router.post('/create-payment-order', protect, async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const { amount, currency = 'INR' } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: makeRazorpayReceipt('wallet'),
      notes: { userId: String(req.user.id), type: 'wallet_recharge' },
    });
    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.RAZOR_PAY_KEY_ID?.trim();
    res.json({
      success: true,
      keyId,
      razorpayOrder: rpOrder,
      amount: Number(amount),
    });
  } catch (error) {
    console.error('Wallet create-payment-order:', error);
    res.status(500).json({
      success: false,
      message: formatRazorpayError(error, 'Failed to create wallet payment order'),
    });
  }
});

// Verify Razorpay payment and credit wallet
router.post('/verify-payment', protect, async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment verification payload' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim() ||
      process.env.RAZOR_PAY_KEY_SECRET?.trim();
    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }

    const creditAmount = Number(amount);
    wallet.transactions.push({
      type: 'credit',
      amount: creditAmount,
      description: 'Wallet recharge via Razorpay',
      paymentMethod: 'razorpay',
      status: 'completed',
    });
    wallet.balance += creditAmount;
    await wallet.save();

    res.json({
      success: true,
      balance: wallet.balance,
      message: 'Wallet recharged successfully',
    });
  } catch (error) {
    console.error('Wallet verify-payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Wallet payment verification failed',
    });
  }
});

/** @deprecated Use create-payment-order + verify-payment */
router.post('/recharge', protect, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(400).json({
      success: false,
      message: 'Use Razorpay wallet recharge flow',
    });
  }
  try {
    const { amount, paymentMethod = 'upi' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Wallet recharge via ${paymentMethod}`,
      paymentMethod,
      status: 'completed',
    });
    wallet.balance += amount;
    await wallet.save();
    res.json({
      success: true,
      balance: wallet.balance,
      message: 'Money added to wallet successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Withdraw from wallet
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(400).json({ success: false, message: 'Wallet not found' });
    }
    if (wallet.balance < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    wallet.transactions.push({
      type: 'debit',
      amount: withdrawAmount,
      description: note?.trim() || 'Wallet withdrawal',
      paymentMethod: 'upi',
      status: 'completed',
    });
    wallet.balance -= withdrawAmount;
    await wallet.save();
    res.json({
      success: true,
      balance: wallet.balance,
      message: 'Withdrawal request processed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet balance only
router.get('/balance', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }

    res.json({ success: true, balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;








