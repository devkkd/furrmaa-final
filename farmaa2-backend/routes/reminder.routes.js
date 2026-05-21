import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Reminder from '../models/Reminder.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's reminders
router.get('/', async (req, res) => {
  try {
    const { type, enabled, petId, date } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (petId) query.pet = petId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const reminders = await Reminder.find(query)
      .populate('pet', 'name type')
      .sort({ date: 1, time: 1 });
    
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id })
      .populate('pet', 'name type');
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create reminder
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      time,
      recurring,
      pet,
      notes,
      enabled = true,
    } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Title, date, and time are required' });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim(),
      type: type || 'other',
      date: new Date(date),
      time: time.trim(),
      recurring: recurring || 'none',
      pet: pet || undefined,
      notes: notes?.trim(),
      enabled,
    });

    await reminder.populate('pet', 'name type');
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Convert date string to Date object if provided
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    Object.assign(reminder, req.body);
    await reminder.save();

    await reminder.populate('pet', 'name type');
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

