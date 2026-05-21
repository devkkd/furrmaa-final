import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Training from '../models/Training.model.js';

const router = express.Router();

// Create training program
router.post('/', protect, async (req, res) => {
  try {
    const training = await Training.create({ ...req.body, pet: req.body.petId });
    res.status(201).json({ success: true, training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's training programs
router.get('/my-trainings', protect, async (req, res) => {
  try {
    const Pet = (await import('../models/Pet.model.js')).default;
    const userPets = await Pet.find({ owner: req.user.id }).select('_id');
    const petIds = userPets.map(pet => pet._id);
    
    const trainings = await Training.find({ pet: { $in: petIds } })
      .populate('trainer', 'name email')
      .populate('pet');
    res.json({ success: true, trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

