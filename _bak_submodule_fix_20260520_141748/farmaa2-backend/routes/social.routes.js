import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Post from '../models/Post.model.js';

const router = express.Router();

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const { content, images, videos, pet } = req.body;

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    // Validate that at least one media is provided if content is minimal
    if (content.trim().length < 10 && (!images || images.length === 0) && (!videos || videos.length === 0)) {
      return res.status(400).json({ success: false, message: 'Please add some content, images, or videos to your post' });
    }

    const post = await Post.create({
      user: req.user.id,
      content: content.trim(),
      images: images || [],
      videos: videos || [],
      pet: pet || undefined,
    });

    // Populate user details in response
    await post.populate('user', 'name profileImage');

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create post' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profileImage')
      .populate('pet')
      .populate('likes', 'name')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like/Unlike post
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const isLiked = post.likes.includes(req.user.id);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      post.likes.push(req.user.id);
    }
    
    await post.save();
    await post.populate('user', 'name profileImage');
    await post.populate('likes', 'name');
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to post
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
      date: new Date(),
    });

    await post.save();
    await post.populate('user', 'name profileImage');
    await post.populate('comments.user', 'name profileImage');
    await post.populate('likes', 'name');

    res.json({ success: true, post });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add comment' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.user', 'name profileImage')
      .select('comments');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, comments: post.comments || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if user owns the comment or is the post owner
    if (comment.user.toString() !== req.user.id.toString() && post.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();
    await post.populate('user', 'name profileImage');
    await post.populate('comments.user', 'name profileImage');
    await post.populate('likes', 'name');

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


