import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import AIChat from '../models/AIChat.model.js';
import { generatePetAIReply, isOpenAIConfigured } from '../services/openai.service.js';

const router = express.Router();

router.get('/status', protect, (req, res) => {
  res.json({
    success: true,
    openaiConfigured: isOpenAIConfigured(),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
});

router.post('/sessions', protect, async (req, res) => {
  try {
    const { title, petContext } = req.body;
    const sessionId = `chat_${Date.now()}_${req.user.id}`;

    const chat = await AIChat.create({
      user: req.user.id,
      sessionId,
      title: title || 'New Chat',
      petContext,
      messages: [],
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/sessions', protect, async (req, res) => {
  try {
    const chats = await AIChat.find({ user: req.user.id, isActive: true })
      .sort({ updatedAt: -1 })
      .select('sessionId title messages petContext createdAt updatedAt');

    const formattedChats = chats.map((chat) => ({
      id: chat.sessionId,
      topic: chat.title,
      timestamp: chat.updatedAt,
      lastMessage:
        chat.messages.length > 0
          ? `${chat.messages[chat.messages.length - 1].content.substring(0, 50)}...`
          : 'No messages yet',
    }));

    res.json({ success: true, chats: formattedChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const chat = await AIChat.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sessions/:sessionId/message', protect, async (req, res) => {
  try {
    const { message, petContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let chat = await AIChat.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!chat) {
      chat = await AIChat.create({
        user: req.user.id,
        sessionId: req.params.sessionId,
        title: message.substring(0, 50),
        petContext: petContext || null,
        messages: [],
      });
    }

    const trimmed = message.trim();

    chat.messages.push({
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    });

    const historyBeforeReply = chat.messages.slice(0, -1);
    const { content: aiResponse, provider } = await generatePetAIReply({
      userMessage: trimmed,
      chatHistory: historyBeforeReply,
      petContext: chat.petContext || petContext,
    });

    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    if (chat.messages.length === 2) {
      chat.title = trimmed.substring(0, 50);
    }

    await chat.save();

    res.json({
      success: true,
      provider,
      message: {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      },
      chat,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const chat = await AIChat.findOne({
      sessionId: req.params.sessionId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/sessions/:sessionId/title', protect, async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await AIChat.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
        user: req.user.id,
      },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
