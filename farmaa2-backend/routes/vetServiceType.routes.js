import express from 'express';
import VetServiceType from '../models/VetServiceType.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public: get all active vet service types (for web & app filter)
router.get('/', async (req, res) => {
  try {
    const types = await VetServiceType.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('name slug source order')
      .maxTimeMS(8000);
    const list = types.map((t) => ({
      id: t._id,
      name: t.name,
      slug: t.slug || t.name,
      source: t.source,
      order: t.order,
    }));
    res.json({ success: true, types: list });
  } catch (error) {
    if (error.message && error.message.includes('buffering timed out')) {
      console.error('MongoDB not connected – vet-service-types returning empty. Check MONGODB_URI.');
      return res.json({ success: true, types: [] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
