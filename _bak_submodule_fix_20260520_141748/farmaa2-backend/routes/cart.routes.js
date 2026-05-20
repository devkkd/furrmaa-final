import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

const router = express.Router();

router.use(protect);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

async function populateCart(cart) {
  return Cart.findById(cart._id).populate(
    'items.product',
    'name images price discountPrice stock isActive'
  );
}

// Get cart
router.get('/', async (req, res) => {
  try {
    const cart = await populateCart(await getOrCreateCart(req.user.id));
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add or increment item
router.post('/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }
    await cart.save();
    const populated = await populateCart(cart);
    res.json({ success: true, cart: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update item quantity
router.put('/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }
    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex((i) => i.product.toString() === req.params.productId);
    if (idx < 0) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }
    cart.items[idx].quantity = qty;
    await cart.save();
    const populated = await populateCart(cart);
    res.json({ success: true, cart: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove item
router.delete('/items/:productId', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await populateCart(cart);
    res.json({ success: true, cart: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.appliedCoupon = undefined;
    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
