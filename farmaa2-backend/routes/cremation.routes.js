import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth.middleware.js';
import CremationCenter from '../models/CremationCenter.model.js';
import CremationRequest from '../models/CremationRequest.model.js';

const router = express.Router();

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function locationFilter(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw) return null;
  const token = raw.split(',')[0].trim();
  if (!token) return null;
  const re = escapeRegex(token);
  return {
    $or: [
      { city: { $regex: re, $options: 'i' } },
      { state: { $regex: re, $options: 'i' } },
      { address: { $regex: re, $options: 'i' } },
    ],
  };
}

// Get cremation centers (by location/city) — admin-added active centers only
router.get('/centers', async (req, res) => {
  try {
    const { city, location, search, state } = req.query;
    const query = { isActive: true };

    const locClause = locationFilter(location || city);
    if (locClause) Object.assign(query, locClause);
    if (state && !locClause) {
      query.state = { $regex: escapeRegex(String(state)), $options: 'i' };
    }
    if (search) {
      const s = escapeRegex(String(search).trim());
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { address: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } },
        ],
      });
    }

    const centers = await CremationCenter.find(query)
      .sort({ city: 1, name: 1, createdAt: -1 });
    
    res.json({ success: true, centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single center
router.get('/centers/:id', async (req, res) => {
  try {
    const center = await CremationCenter.findById(req.params.id);
    if (!center || !center.isActive) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    res.json({ success: true, center });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create cremation request (public – no login required; accepts flat body: cremationCenterId, fullName, mobileNumber, address, petSpecies, petName, breed, age, sex)
router.post('/requests', async (req, res) => {
  try {
    const b = req.body || {};
    const centerIdRaw = b.cremationCenterId || b.center;
    const centerId = (centerIdRaw && mongoose.Types.ObjectId.isValid(centerIdRaw)) ? centerIdRaw : null;
    const payload = {
      user: req.user?.id || null,
      center: centerId || undefined,
      ownerInformation: {
        fullName: b.fullName ?? b.ownerInformation?.fullName ?? '',
        mobileNumber: b.mobileNumber ?? b.ownerInformation?.mobileNumber ?? '',
        address: b.address ?? b.ownerInformation?.address ?? '',
      },
      petInformation: {
        petName: b.petName ?? b.petInformation?.petName ?? '',
        petType: (b.petSpecies || b.petInformation?.petType || 'other').toString().toLowerCase().replace(/s$/, ''),
        petBreed: b.breed ?? b.petInformation?.petBreed,
        ageYears: b.age ?? b.petInformation?.ageYears,
        sex: 'unknown',
      },
      pickupLocation: b.pickupLocation || b.address || '',
      notes: b.notes,
    };
    if (payload.petInformation.petType === 'dog' || payload.petInformation.petType === 'cat') { /* keep */ } else {
      payload.petInformation.petType = 'other';
    }
    const sexRaw = (b.sex || b.petInformation?.sex || '').toString().toLowerCase();
    if (sexRaw === 'male' || sexRaw === 'female') payload.petInformation.sex = sexRaw;
    const request = await CremationRequest.create(payload);
    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// List my cremation requests
router.get('/requests/me', protect, async (req, res) => {
  try {
    const requests = await CremationRequest.find({ user: req.user.id })
      .populate('center')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


