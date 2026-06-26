import express from 'express';
import Category from '../models/Category.model.js';
import { setPublicCache } from '../utils/httpCache.js';

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

let defaultCategoriesEnsured = false;

async function ensureDefaultCategories() {
  if (defaultCategoriesEnsured) return;
  for (const c of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { slug: c.slug },
      {
        $setOnInsert: {
          name: c.name,
          slug: c.slug,
          displayOrder: c.displayOrder,
          section: 'all',
          petType: ['both'],
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
  defaultCategoriesEnsured = true;
}

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find({ isActive: true })
      .select('name slug displayOrder section petType image icon isActive')
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    setPublicCache(res, 600);
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
      query.$or = [{ section }, { section: 'all' }];
    }

    if (petType) {
      query.petType = { $in: [petType.toLowerCase(), 'both'] };
    }

    const categories = await Category.find(query)
      .select('name slug displayOrder section petType image icon')
      .sort({ displayOrder: 1, name: 1 })
      .limit(20)
      .lean();

    setPublicCache(res, 600);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
