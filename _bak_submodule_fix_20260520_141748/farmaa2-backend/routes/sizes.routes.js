import express from 'express';
import ProductSize from '../models/ProductSize.model.js';

const router = express.Router();

const DEFAULT_SIZES = [
  { name: 'Small', slug: 'small', displayOrder: 1 },
  { name: 'Medium', slug: 'medium', displayOrder: 2 },
  { name: 'Large', slug: 'large', displayOrder: 3 },
  { name: 'Extra Large', slug: 'extra-large', displayOrder: 4 },
];

router.get('/', async (req, res) => {
  try {
    for (const s of DEFAULT_SIZES) {
      await ProductSize.findOneAndUpdate(
        { slug: s.slug },
        { $setOnInsert: { name: s.name, slug: s.slug, displayOrder: s.displayOrder, isActive: true } },
        { upsert: true }
      );
    }
    const sizes = await ProductSize.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, sizes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
