import express from 'express';
import WhyChooseFeature from '../models/WhyChooseFeature.model.js';
import WhyChooseSettings from '../models/WhyChooseSettings.model.js';
import { setPublicCache } from '../utils/httpCache.js';

const router = express.Router();

const DEFAULT_TAGLINE =
  'Furrmaa Is Built To Simplify Pet Parenting Without Compromising Care, Safety, Or Love.';

async function getTagline() {
  const settings = await WhyChooseSettings.findOne({ key: 'homepage' }).lean();
  return settings?.tagline || DEFAULT_TAGLINE;
}

// Public – homepage "Why Pet Parents Choose Furrmaa"
router.get('/', async (req, res) => {
  try {
    const features = await WhyChooseFeature.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('title image displayOrder')
      .lean();
    const tagline = await getTagline();
    setPublicCache(res, 300);
    res.json({ success: true, tagline, features });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
