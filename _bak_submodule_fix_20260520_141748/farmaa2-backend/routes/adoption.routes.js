import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Adoption from '../models/Adoption.model.js';
import Pet from '../models/Pet.model.js';

const router = express.Router();

// Get available pets for adoption
router.get('/pets', async (req, res) => {
  try {
    const { type, breed, age } = req.query;
    const query = { isAdopted: false };
    
    if (type) query.type = type;
    if (breed) query.breed = { $regex: breed, $options: 'i' };
    if (age) query.age = { $lte: parseInt(age) };
    
    const pets = await Pet.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single pet for adoption
router.get('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'name email phone address');
    
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    
    res.json({ success: true, pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create adoption request
router.post('/', protect, async (req, res) => {
  try {
    const adoption = await Adoption.create({ ...req.body, applicant: req.user.id });
    res.status(201).json({ success: true, adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get adoption requests
router.get('/', async (req, res) => {
  try {
    const adoptions = await Adoption.find({ status: 'pending' })
      .populate('pet')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, adoptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


