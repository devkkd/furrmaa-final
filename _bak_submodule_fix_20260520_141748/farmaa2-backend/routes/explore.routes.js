import express from 'express';
import ExploreContent from '../models/ExploreContent.model.js';

const router = express.Router();

// Get all active explore content
router.get('/', async (req, res) => {
  try {
    const { category, type, petType, featured } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (petType) query.petType = { $in: [petType, 'both'] };
    if (featured === 'true') query.featured = true;

    const content = await ExploreContent.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single content
router.get('/:id', async (req, res) => {
  try {
    const content = await ExploreContent.findById(req.params.id);
    if (!content || !content.isActive) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // Increment views
    content.views += 1;
    await content.save();
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




