import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Subscription from '../models/Subscription.model.js';
import Wallet from '../models/Wallet.model.js';
import crypto from 'crypto';
import {
  getRazorpay,
  hasRazorpayConfig,
  makeRazorpayReceipt,
  formatRazorpayError,
} from '../utils/razorpayClient.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user subscription
router.get('/', async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    // Create default free subscription if not exists
    if (!subscription) {
      subscription = await Subscription.create({ user: req.user.id, plan: 'free' });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update subscription
router.put('/', async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      subscription = await Subscription.create({ 
        user: req.user.id, 
        plan: 'free',
        ...req.body 
      });
    } else {
      // If updating plan, set start date and calculate end date
      if (req.body.plan && req.body.plan !== subscription.plan) {
        subscription.plan = req.body.plan;
        subscription.startDate = new Date();
        
        // Calculate end date (30 days from now for paid plans)
        if (req.body.plan !== 'free') {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          subscription.endDate = endDate;
          subscription.nextBillingDate = endDate;
          subscription.isActive = true;
        }
      }
      
      // Update other fields
      if (req.body.endDate !== undefined) subscription.endDate = req.body.endDate;
      if (req.body.isActive !== undefined) subscription.isActive = req.body.isActive;
      if (req.body.autoRenew !== undefined) subscription.autoRenew = req.body.autoRenew;
      if (req.body.nextBillingDate !== undefined) subscription.nextBillingDate = req.body.nextBillingDate;
      if (req.body.lastPaymentDate !== undefined) subscription.lastPaymentDate = req.body.lastPaymentDate;
      if (req.body.paymentMethod !== undefined) subscription.paymentMethod = req.body.paymentMethod;
      
      await subscription.save();
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upgrade/Change plan
router.post('/upgrade', async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Support training plan as well (maps to premium for training access)
    const validPlans = ['free', 'basic', 'premium', 'premium_plus', 'training'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    
    // Map training to premium for backend compatibility
    const actualPlan = plan === 'training' ? 'premium' : plan;

    let subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      subscription = await Subscription.create({ 
        user: req.user.id, 
        plan: actualPlan,
        planType: plan === 'training' ? 'training' : undefined, // Track if it's training subscription
      });
    } else {
      subscription.plan = actualPlan;
      if (plan === 'training') subscription.planType = 'training';
      subscription.startDate = new Date();
      
      if (plan !== 'free') {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        subscription.endDate = endDate;
        subscription.nextBillingDate = endDate;
        subscription.isActive = true;
        subscription.lastPaymentDate = new Date();
      } else {
        subscription.endDate = undefined;
        subscription.nextBillingDate = undefined;
        subscription.autoRenew = false;
      }
      
      await subscription.save();
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Pay for subscription using wallet balance
router.post('/pay-with-wallet', async (req, res) => {
  try {
    const { plan = 'training', amount = 999 } = req.body || {};
    const validPlans = ['free', 'basic', 'premium', 'premium_plus', 'training'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }
    if (wallet.balance < payAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please recharge your wallet.',
      });
    }

    wallet.transactions.push({
      type: 'debit',
      amount: payAmount,
      description: `${plan} subscription payment`,
      paymentMethod: 'wallet',
      status: 'completed',
    });
    wallet.balance -= payAmount;
    await wallet.save();

    const actualPlan = plan === 'training' ? 'premium' : plan;
    let subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user.id,
        plan: actualPlan,
        planType: plan === 'training' ? 'training' : undefined,
      });
    } else {
      subscription.plan = actualPlan;
      if (plan === 'training') subscription.planType = 'training';
    }
    subscription.startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    subscription.endDate = endDate;
    subscription.nextBillingDate = endDate;
    subscription.lastPaymentDate = new Date();
    subscription.paymentMethod = 'wallet';
    subscription.isActive = true;
    subscription.lastPaymentAmount = payAmount;
    await subscription.save();

    res.json({
      success: true,
      subscription,
      walletBalance: wallet.balance,
      message: 'Subscription activated with wallet',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Wallet subscription payment failed' });
  }
});

// Create Razorpay order for subscription payment
router.post('/create-payment-order', async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const { plan = 'premium', amount = 999, currency = 'INR' } = req.body || {};
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: makeRazorpayReceipt('sub'),
      notes: { userId: String(req.user.id), plan: String(plan) },
    });
    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.RAZOR_PAY_KEY_ID?.trim();
    res.json({
      success: true,
      keyId,
      razorpayOrder: rpOrder,
      plan,
      amount,
    });
  } catch (error) {
    console.error('Subscription create-payment-order:', error);
    res.status(500).json({
      success: false,
      message: formatRazorpayError(error, 'Failed to create subscription payment order'),
    });
  }
});

// Verify Razorpay payment and activate subscription
router.post('/verify-payment', async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan = 'premium',
      amount = 999,
      paymentMethod = 'razorpay',
    } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment verification payload' });
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

    const validPlans = ['free', 'basic', 'premium', 'premium_plus', 'training'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    const actualPlan = plan === 'training' ? 'premium' : plan;
    let subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user.id,
        plan: actualPlan,
      });
    } else {
      subscription.plan = actualPlan;
    }
    if (plan === 'training') subscription.planType = 'training';
    subscription.startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    subscription.endDate = endDate;
    subscription.nextBillingDate = endDate;
    subscription.lastPaymentDate = new Date();
    subscription.paymentMethod = paymentMethod;
    subscription.isActive = true;
    subscription.razorpayOrderId = razorpay_order_id;
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    subscription.lastPaymentAmount = Number(amount) || 999;
    await subscription.save();
    res.json({ success: true, subscription, message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Subscription verify-payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Subscription payment verification failed',
    });
  }
});

export default router;




