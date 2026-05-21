import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Pet from '../models/Pet.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's pets
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.json({ success: true, pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create pet (for logged-in user)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      age,
      gender,
      weight,
      color,
      description,
      images,
    } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    // Create pet
    const pet = await Pet.create({
      owner: req.user.id,
      name: name.trim(),
      type,
      breed: breed?.trim(),
      age: age ? parseInt(age) : undefined,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      color: color?.trim(),
      description: description?.trim(),
      images: Array.isArray(images) ? images : [],
    });

    // Add pet to user's pets array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { pets: pet._id }
    });

    res.status(201).json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update pet
router.put('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    Object.assign(pet, req.body);
    await pet.save();

    res.json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete pet
router.delete('/:id', async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { pets: pet._id }
    });

    await pet.deleteOne();
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;








