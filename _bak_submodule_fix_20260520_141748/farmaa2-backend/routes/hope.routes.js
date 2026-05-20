import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import HopePost from '../models/HopePost.model.js';

const router = express.Router();

// Escape regex special chars for safe $regex
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// List posts (filters optional)
router.get('/posts', async (req, res) => {
  try {
    const { postType, petType, location, search, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };
    
    if (postType) query.postType = String(postType);
    if (petType) query.petType = String(petType);
    if (location) {
      const locStr = String(location).trim();
      const cityPart = locStr.split(',')[0].trim() || locStr;
      query.locationText = { $regex: escapeRegex(cityPart), $options: 'i' };
    }
    if (search) {
      query.$or = [
        { petName: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
        { locationText: { $regex: String(search), $options: 'i' } },
      ];
    }

    const posts = await HopePost.find(query)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await HopePost.countDocuments(query);

    res.json({ 
      success: true, 
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await HopePost.findById(req.params.id)
      .populate('user', 'name profileImage email phone');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create post
router.post('/posts', protect, async (req, res) => {
  try {
    const post = await HopePost.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Report post
router.post('/posts/:id/report', protect, async (req, res) => {
  try {
    const post = await HopePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.reportsCount += 1;
    await post.save();
    res.json({ success: true, message: 'Reported', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


