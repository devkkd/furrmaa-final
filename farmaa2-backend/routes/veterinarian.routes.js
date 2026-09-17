import express from 'express';
import User from '../models/User.model.js';
import { vetLocationClause, preferredCityToken } from '../utils/locationFilter.js';

const router = express.Router();

// Get all veterinarians
router.get('/', async (req, res) => {
  try {
    const { category, city, location, specialization, serviceType: serviceTypeRaw } = req.query;
    const serviceType = Array.isArray(serviceTypeRaw) ? serviceTypeRaw[0] : serviceTypeRaw;
    const query = {
      role: 'veterinarian',
      isActive: true,
    };

    if (category && category !== 'All') {
      query.specialization = category;
    }
    const andClauses = [];
    // Prefer city token so "Jaipur Municipal..." matches address.city "Jaipur"
    const locRaw = location || city;
    const locForFilter = preferredCityToken(locRaw) || locRaw;
    const vetLoc = vetLocationClause(locForFilter);
    if (vetLoc) andClauses.push(vetLoc);
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (serviceType && String(serviceType).trim() !== '' && String(serviceType).trim() !== 'All') {
      const typeStr = String(serviceType).trim();
      const typeRegex = new RegExp(`^${typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      if (typeRegex.test('Veterinarians')) {
        andClauses.push({
          $or: [
            { serviceType: typeRegex },
            { serviceType: { $in: [null, ''] } },
          ],
        });
      } else {
        query.serviceType = typeRegex;
      }
    }
    if (andClauses.length) query.$and = andClauses;

    const veterinarians = await User.find(query).select(
      'name email phone address profileImage specialization qualification clinicName experience licenseNumber rating totalReviews serviceType'
    ).sort({ rating: -1, createdAt: -1 });

    res.json({ success: true, veterinarians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
