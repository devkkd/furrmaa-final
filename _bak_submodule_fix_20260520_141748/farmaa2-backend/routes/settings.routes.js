import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Settings from '../models/Settings.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });
    
    if (!settings) {
      settings = await Settings.create({ user: req.user.id, ...req.body });
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;




