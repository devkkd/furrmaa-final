import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import AIChat from '../models/AIChat.model.js';
import axios from 'axios';

const router = express.Router();

// Generate AI response using OpenAI API or fallback
const generateAIResponse = async (userMessage, petContext = null) => {
  try {
    // If OpenAI API key is available, use it
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful pet care assistant for Furrmaa app. Provide accurate, friendly advice about pet health, care, nutrition, behavior, and general pet-related questions. ${petContext ? `The user has a ${petContext.petType} named ${petContext.petName}.` : ''} Keep responses concise, helpful, and pet-focused.`,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } else {
      // Fallback response when OpenAI is not configured
      return generateFallbackResponse(userMessage, petContext);
    }
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback response on error
    return generateFallbackResponse(userMessage, petContext);
  }
};

// Fallback AI responses (rule-based)
const generateFallbackResponse = (userMessage, petContext) => {
  const message = userMessage.toLowerCase();
  
  // Health-related queries
  if (message.includes('health') || message.includes('sick') || message.includes('symptom')) {
    return 'For pet health concerns, I recommend consulting with a veterinarian. You can find nearby vets in the Vet section of the app. For general health tips, ensure your pet has regular check-ups, proper nutrition, and exercise.';
  }
  
  // Nutrition queries
  if (message.includes('food') || message.includes('nutrition') || message.includes('diet') || message.includes('feed')) {
    return 'Pet nutrition is important! Choose high-quality pet food appropriate for your pet\'s age, size, and health needs. Avoid human foods that can be toxic. You can find quality pet food in our Shop section.';
  }
  
  // Behavior queries
  if (message.includes('behavior') || message.includes('training') || message.includes('bark') || message.includes('aggressive')) {
    return 'Pet behavior can be improved with consistent training and positive reinforcement. Check out our Training section for programs. For serious behavioral issues, consider consulting a professional trainer or veterinarian.';
  }
  
  // Grooming queries
  if (message.includes('groom') || message.includes('bath') || message.includes('clean')) {
    return 'Regular grooming keeps your pet healthy and comfortable. You can book grooming services through our Services section. Frequency depends on your pet\'s breed and coat type.';
  }
  
  // Vet queries
  if (message.includes('vet') || message.includes('doctor') || message.includes('clinic') || message.includes('hospital')) {
    return 'You can find nearby veterinarians in the Vet section. For emergencies, use our Emergency feature. Regular vet visits are essential for your pet\'s health.';
  }
  
  // Adoption queries
  if (message.includes('adopt') || message.includes('adoption')) {
    return 'Great that you\'re considering adoption! Check out our Adoption section to see pets available for adoption. Adoption is a wonderful way to give a pet a loving home.';
  }
  
  // Lost and found
  if (message.includes('lost') || message.includes('found') || message.includes('missing')) {
    return 'If your pet is lost, check our Hope section for lost and found posts. You can also create a post there. Act quickly and check local shelters and vet clinics.';
  }
  
  // General fallback
  return 'I\'m here to help with pet-related questions! You can ask about pet health, nutrition, behavior, grooming, finding vets, adoption, or any other pet care topics. How can I assist you today?';
};

// Create new chat session
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

// Get all chat sessions for user
router.get('/sessions', protect, async (req, res) => {
  try {
    const chats = await AIChat.find({ user: req.user.id, isActive: true })
      .sort({ updatedAt: -1 })
      .select('sessionId title messages petContext createdAt updatedAt');

    // Format for frontend
    const formattedChats = chats.map(chat => ({
      id: chat.sessionId,
      topic: chat.title,
      timestamp: chat.updatedAt,
      lastMessage: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + '...'
        : 'No messages yet',
    }));

    res.json({ success: true, chats: formattedChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single chat session with messages
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

// Send message and get AI response
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

    // Create session if it doesn't exist
    if (!chat) {
      chat = await AIChat.create({
        user: req.user.id,
        sessionId: req.params.sessionId,
        title: message.substring(0, 50),
        petContext: petContext || null,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(message.trim(), chat.petContext || petContext);
    
    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update title if it's the first message
    if (chat.messages.length === 2) {
      chat.title = message.substring(0, 50);
    }

    await chat.save();

    res.json({
      success: true,
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

// Delete chat session
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

// Update chat title
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


