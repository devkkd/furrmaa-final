import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Coupon from '../models/Coupon.model.js';
import Wallet from '../models/Wallet.model.js';
import crypto from 'crypto';
import {
  getRazorpay,
  hasRazorpayConfig,
  makeRazorpayReceipt,
  formatRazorpayError,
} from '../utils/razorpayClient.js';

const router = express.Router();

async function afterOrderPlaced(userId, couponCode) {
  await Cart.findOneAndUpdate({ user: userId }, { items: [], appliedCoupon: undefined });
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: String(couponCode).toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }
}

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, discount, deliveryFee, couponCode } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid total amount is required' });
    }

    if (paymentMethod === 'wallet') {
      let wallet = await Wallet.findOne({ user: req.user.id });
      if (!wallet) {
        wallet = await Wallet.create({ user: req.user.id, balance: 0 });
      }
      if (wallet.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance. Please recharge your wallet.',
        });
      }
    }

    // Set payment status based on payment method
    let paymentStatus = 'pending';
    if (paymentMethod === 'cash') {
      paymentStatus = 'pending'; // Cash on delivery
    } else if (paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'wallet') {
      paymentStatus = 'paid';
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      totalAmount,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      orderStatus: 'pending',
      couponCode: couponCode || undefined,
    });

    await order.populate('items.product', 'name images price');

    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ user: req.user.id });
      if (wallet) {
        wallet.transactions.push({
          type: 'debit',
          amount: totalAmount,
          description: `Order payment #${order._id.toString().slice(-6).toUpperCase()}`,
          order: order._id,
          paymentMethod: 'wallet',
          status: 'completed',
        });
        wallet.balance -= totalAmount;
        await wallet.save();
      }
    }

    await afterOrderPlaced(req.user.id, couponCode);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
});

// Create Razorpay order for product checkout (protected)
router.post('/create-payment-order', protect, async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const { amount, currency = 'INR', receipt, notes = {} } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: (receipt && String(receipt).length <= 40
        ? String(receipt)
        : makeRazorpayReceipt('ord')),
      notes: { userId: String(req.user.id), ...notes },
    });
    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim() ||
      process.env.RAZOR_PAY_KEY_ID?.trim();
    res.json({
      success: true,
      keyId,
      razorpayOrder: rpOrder,
    });
  } catch (error) {
    console.error('Order create-payment-order:', error);
    res.status(500).json({
      success: false,
      message: formatRazorpayError(error, 'Failed to create payment order'),
    });
  }
});

// Verify Razorpay payment and create order (protected)
router.post('/verify-payment', protect, async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
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

    const { items, shippingAddress, totalAmount, discount, deliveryFee, couponCode } = orderData;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      totalAmount,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      orderStatus: 'pending',
      couponCode: couponCode || undefined,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });
    await order.populate('items.product', 'name images price');
    await afterOrderPlaced(req.user.id, couponCode);
    res.status(201).json({ success: true, message: 'Payment verified and order placed', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rate delivered order
router.patch('/:id/rating', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.rating = r;
    order.ratingComment = comment || '';
    order.ratedAt = new Date();
    await order.save();
    res.json({ success: true, message: 'Rating submitted', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit return request for order
router.post('/:id/return', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.orderStatus === 'returned' ||
      order.orderStatus === 'return_requested' ||
      order.orderStatus === 'cancelled'
    ) {
      return res.status(400).json({ success: false, message: 'Order cannot be returned' });
    }

    // Update order status to return requested
    order.orderStatus = 'return_requested';
    order.returnReason = req.body.reason || req.body.description;
    order.returnRequestedAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Return request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


