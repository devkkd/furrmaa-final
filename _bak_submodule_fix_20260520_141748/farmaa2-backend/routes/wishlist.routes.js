import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Wishlist from '../models/Wishlist.model.js';
import Product from '../models/Product.model.js';

const router = express.Router();

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to wishlist
router.post('/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      user: req.user.id,
      product: req.params.productId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      user: req.user.id,
      product: req.params.productId
    });

    await wishlistItem.populate('product');
    res.status(201).json({ success: true, wishlistItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user.id,
      product: req.params.productId
    });

    if (!wishlistItem) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
    }

    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user.id,
      product: req.params.productId
    });

    res.json({ success: true, inWishlist: !!wishlistItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;








