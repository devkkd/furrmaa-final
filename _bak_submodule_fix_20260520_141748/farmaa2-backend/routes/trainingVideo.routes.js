import express from 'express';
import TrainingVideo from '../models/TrainingVideo.model.js';

const router = express.Router();

// Get all active training videos
router.get('/', async (req, res) => {
  try {
    const { category, level, petType } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (petType) query.petType = { $in: [petType, 'both'] };

    const videos = await TrainingVideo.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);
    if (!video || !video.isActive) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    
    // Increment views
    video.views += 1;
    await video.save();
    
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




