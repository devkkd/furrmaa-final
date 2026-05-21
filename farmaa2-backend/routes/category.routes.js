import express from 'express';
import Category from '../models/Category.model.js';

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: 'Food', slug: 'food', displayOrder: 1 },
  { name: 'Toys', slug: 'toys', displayOrder: 2 },
  { name: 'Accessories', slug: 'accessories', displayOrder: 3 },
  { name: 'Grooming', slug: 'grooming', displayOrder: 4 },
  { name: 'Health', slug: 'health', displayOrder: 5 },
  { name: 'Bedding', slug: 'bedding', displayOrder: 6 },
  { name: 'Other', slug: 'other', displayOrder: 7 },
];

// Get all categories (public). Pehle wali 7 hamesha rahengi; nayi add ki hui unke saath aayengi.
router.get('/', async (req, res) => {
  try {
    // Ensure default 7 categories exist (insert only if missing – overwrite mat karo)
    for (const c of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: c.slug },
        { $setOnInsert: { name: c.name, slug: c.slug, displayOrder: c.displayOrder, section: 'all', petType: ['both'], isActive: true } },
        { upsert: true }
      );
    }
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get main categories for home page sections
router.get('/main', async (req, res) => {
  try {
    const { section, petType } = req.query;
    const query = { isActive: true };
    
    if (section) {
      query.$or = [
        { section: section },
        { section: 'all' }
      ];
    }
    
    if (petType) {
      query.petType = { $in: [petType.toLowerCase(), 'both'] };
    }
    
    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .limit(20);
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

