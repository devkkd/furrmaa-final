import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Coupon from '../models/Coupon.model.js';

const router = express.Router();

// Validate coupon (optional auth — works with or without login)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    const coupon = await Coupon.findOne({
      code: String(code).trim().toUpperCase(),
      isActive: true,
    });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < (coupon.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }
    let discountAmount = Math.round((orderSubtotal * coupon.discountPercent) / 100);
    if (coupon.maxDiscount != null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
