import express from 'express';
import ProductSize from '../models/ProductSize.model.js';
import { setPublicCache } from '../utils/httpCache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sizes = await ProductSize.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    setPublicCache(res, 300);
    res.json({ success: true, sizes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
