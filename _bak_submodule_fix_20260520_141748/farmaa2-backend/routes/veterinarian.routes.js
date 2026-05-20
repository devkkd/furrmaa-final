import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const router = express.Router();

// Get all veterinarians
router.get('/', async (req, res) => {
  try {
    const { category, city, specialization, serviceType: serviceTypeRaw } = req.query;
    // Normalize: query params can be string or array (e.g. ?serviceType=X)
    const serviceType = Array.isArray(serviceTypeRaw) ? serviceTypeRaw[0] : serviceTypeRaw;
    const query = { 
      role: 'veterinarian',
      isActive: true 
    };
    
    if (category && category !== 'All') {
      query.specialization = category;
    }
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    // Filter by vet service type – jo type select hai sirf wahi vets
    if (serviceType && String(serviceType).trim() !== '' && String(serviceType).trim() !== 'All') {
      const typeStr = String(serviceType).trim();
      const typeRegex = new RegExp(`^${typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      // Purane vets (serviceType null/empty) sirf "Veterinarians" tab me dikhen
      if (typeRegex.test('Veterinarians')) {
        query.$or = [
          { serviceType: typeRegex },
          { serviceType: { $in: [null, ''] } },
        ];
      } else {
        query.serviceType = typeRegex;
      }
    }
    
    const veterinarians = await User.find(query).select(
      'name email phone address profileImage specialization qualification clinicName experience licenseNumber rating totalReviews serviceType'
    ).sort({ rating: -1, createdAt: -1 });
    
    res.json({ success: true, veterinarians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


