import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import SupportChat from '../models/SupportChat.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all support chats
router.get('/', async (req, res) => {
  try {
    const chats = await SupportChat.find({ user: req.user.id })
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single chat
router.get('/:id', async (req, res) => {
  try {
    const chat = await SupportChat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create support chat
router.post('/', async (req, res) => {
  try {
    const chat = await SupportChat.create({
      user: req.user.id,
      subject: req.body.subject,
      messages: [{
        sender: 'user',
        message: req.body.message
      }]
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Send message in chat
router.post('/:id/message', async (req, res) => {
  try {
    const chat = await SupportChat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.messages.push({
      sender: 'user',
      message: req.body.message,
      attachments: req.body.attachments || []
    });

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;




