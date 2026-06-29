import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Feedback from '../models/Feedback.model.js';
import { setPublicCache } from '../utils/httpCache.js';

const router = express.Router();

// Featured testimonials for homepage (public)
router.get('/featured', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
    const feedbacks = await Feedback.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name role subject message rating type createdAt')
      .lean();
    setPublicCache(res, 120);
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create feedback (public - no auth required)
router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      user: req.user?.id || null
    });

    res.status(201).json({ success: true, feedback, message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user feedback (protected)
router.get('/my-feedback', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




