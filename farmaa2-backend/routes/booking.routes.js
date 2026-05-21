import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Booking from '../models/Booking.model.js';

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('serviceProvider', 'name email phone')
      .populate('pet')
      .sort({ date: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


