import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import HopeChat from '../models/HopeChat.model.js';
import HopePost from '../models/HopePost.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get or create chat for a post
router.post('/:postId/start', async (req, res) => {
  try {
    const post = await HopePost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if chat already exists
    let chat = await HopeChat.findOne({
      post: req.params.postId,
      participants: { $all: [req.user.id, post.user] },
      isActive: true
    });

    if (!chat) {
      // Create new chat
      chat = await HopeChat.create({
        post: req.params.postId,
        participants: [req.user.id, post.user],
        messages: [],
      });
    }

    await chat.populate('participants', 'name profileImage');
    await chat.populate('post', 'petName postType');

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's chats
router.get('/', async (req, res) => {
  try {
    const chats = await HopeChat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name profileImage')
      .populate('post', 'petName postType petType locationText')
      .populate('lastMessage.sender', 'name')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single chat with messages
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await HopeChat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name profileImage')
      .populate('post', 'petName postType petType locationText images')
      .populate('messages.sender', 'name profileImage');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/:chatId/message', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const chat = await HopeChat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Add message
    const message = {
      sender: req.user.id,
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content: content.trim(),
      timestamp: new Date(),
      sender: req.user.id,
    };

    await chat.save();
    await chat.populate('messages.sender', 'name profileImage');

    res.json({
      success: true,
      message: chat.messages[chat.messages.length - 1],
      chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', async (req, res) => {
  try {
    const chat = await HopeChat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark messages not sent by current user as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id.toString()) {
        msg.read = true;
      }
    });

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete chat
router.delete('/:chatId', async (req, res) => {
  try {
    const chat = await HopeChat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;








