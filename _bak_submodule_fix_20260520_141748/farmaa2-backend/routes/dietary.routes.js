import express from 'express';
import ProductDietary from '../models/ProductDietary.model.js';

const router = express.Router();

const DEFAULT_DIETARY = [
  { name: 'Grain-Free', slug: 'grain-free', displayOrder: 1 },
  { name: 'High-Protein', slug: 'high-protein', displayOrder: 2 },
  { name: 'Weight Control', slug: 'weight-control', displayOrder: 3 },
  { name: 'Hypoallergenic', slug: 'hypoallergenic', displayOrder: 4 },
  { name: 'Senior Formula', slug: 'senior-formula', displayOrder: 5 },
  { name: 'Vegan', slug: 'vegan', displayOrder: 6 },
];

router.get('/', async (req, res) => {
  try {
    for (const d of DEFAULT_DIETARY) {
      await ProductDietary.findOneAndUpdate(
        { slug: d.slug },
        { $setOnInsert: { name: d.name, slug: d.slug, displayOrder: d.displayOrder, isActive: true } },
        { upsert: true }
      );
    }
    const dietary = await ProductDietary.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, dietary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
