import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Emergency from '../models/Emergency.model.js';

const router = express.Router();

// Create emergency request
router.post('/', protect, async (req, res) => {
  try {
    const emergency = await Emergency.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, emergency });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active emergencies
router.get('/active', protect, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'active' })
      .populate('user', 'name email phone')
      .populate('pet')
      .sort({ createdAt: -1 });
    res.json({ success: true, emergencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


