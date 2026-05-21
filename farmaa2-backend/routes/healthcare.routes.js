import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Pet from '../models/Pet.model.js';

const router = express.Router();

// Get pet medical history
router.get('/pet/:petId/history', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet || pet.owner.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.json({ success: true, medicalHistory: pet.medicalHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add medical record
router.post('/pet/:petId/record', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet || pet.owner.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    pet.medicalHistory.push(req.body);
    await pet.save();
    res.json({ success: true, pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


