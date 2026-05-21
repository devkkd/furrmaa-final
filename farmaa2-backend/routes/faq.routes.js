import express from 'express';
import FAQ from '../models/FAQ.model.js';

const router = express.Router();

// Get all FAQs (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
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
      isActive: true 
    }).sort({ order: 1 });

    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




