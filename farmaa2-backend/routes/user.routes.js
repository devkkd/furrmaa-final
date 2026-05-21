import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('pets');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile (whitelist fields — profileImage persist)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, profileImage } = req.body;

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const existing = await User.findOne({ email: newEmail });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
        user.email = newEmail;
      }
    }

    if (phone !== undefined && phone !== null) {
      const digits = String(phone).replace(/\D/g, '').slice(-10);
      user.phone = digits || undefined;
    }

    if (typeof profileImage === 'string' && profileImage.trim()) {
      user.profileImage = profileImage.trim();
    }

    await user.save();

    const safeUser = await User.findById(user._id).select('-password').populate('pets');
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user account
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete - set isActive to false instead of actually deleting
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


