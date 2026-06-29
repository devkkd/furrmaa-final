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
      { slug: c.slug, section: 'all', petScope: 'both' },
      {
        $setOnInsert: {
          name: c.name,
          slug: c.slug,
          displayOrder: c.displayOrder,
          section: 'all',
          petType: ['both'],
          petScope: 'both',
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
  defaultCategoriesEnsured = true;
}

// Get all categories (public) — default: shop categories (section=all)
router.get('/', async (req, res) => {
  try {
    await ensureDefaultCategories();
    const { section } = req.query;
    const query = { isActive: true };
    query.section = section && String(section).trim() ? String(section).trim() : 'all';

    const categories = await Category.find(query)
      .select('name slug displayOrder section petType petScope image icon isActive')
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    setPublicCache(res, 600);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Home page sections: Everyday Essentials / All Round Wellness (per pet type)
router.get('/main', async (req, res) => {
  try {
    const { section, petType } = req.query;
    if (!section || !['everyday', 'wellness'].includes(String(section))) {
      return res.status(400).json({ success: false, message: 'section must be everyday or wellness' });
    }

    const query = { isActive: true, section: String(section) };

    if (petType) {
      const pt = String(petType).toLowerCase();
      query.petScope = { $in: [pt, 'both'] };
    }

    const categories = await Category.find(query)
      .select('name slug displayOrder section petType petScope image icon')
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
