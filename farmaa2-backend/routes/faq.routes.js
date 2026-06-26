import express from 'express';
import FAQ from '../models/FAQ.model.js';
import { setPublicCache } from '../utils/httpCache.js';

const router = express.Router();

// Get all FAQs (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .select('question answer category order isActive')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    setPublicCache(res, 600);
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get FAQs by category
router.get('/category/:category', async (req, res) => {
  try {
    const faqs = await FAQ.find({
      category: req.params.category,
      isActive: true,
    })
      .select('question answer category order')
      .sort({ order: 1 })
      .lean();
    setPublicCache(res, 600);

    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




