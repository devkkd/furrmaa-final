import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Feedback from '../models/Feedback.model.js';

const router = express.Router();

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




