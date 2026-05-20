import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import TrainingProgress from '../models/TrainingProgress.model.js';
import mongoose from 'mongoose';

const router = express.Router();

router.use(protect);

// GET /api/training-progress - get user's completed video IDs (optional ?category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let progress = await TrainingProgress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await TrainingProgress.create({ user: req.user.id, completedVideoIds: [] });
    }
    const completedVideoIds = (progress.completedVideoIds || []).map((id) => String(id));
    res.json({ success: true, completedVideoIds, byCategory: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/training-progress - mark a video as complete
router.post('/', async (req, res) => {
  try {
    const { videoId, category } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'videoId is required' });
    }
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({ success: false, message: 'Invalid videoId' });
    }
    const id = new mongoose.Types.ObjectId(videoId);
    let progress = await TrainingProgress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await TrainingProgress.create({ user: req.user.id, completedVideoIds: [id] });
    } else {
      if (!progress.completedVideoIds.some((oid) => String(oid) === String(videoId))) {
        progress.completedVideoIds.push(id);
        await progress.save();
      }
    }
    const completedVideoIds = (progress.completedVideoIds || []).map((oid) => String(oid));
    res.json({ success: true, completedVideoIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
