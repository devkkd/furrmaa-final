import express from 'express';
import User from '../models/User.model.js';
import { vetLocationClause } from '../utils/locationFilter.js';

const router = express.Router();

function serviceTypeFilter(serviceType) {
  const typeStr = String(serviceType).trim();
  if (!typeStr || typeStr === 'All') return null;
  const typeRegex = new RegExp(`^${typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  return {
    $or: [
      { serviceType: typeRegex },
      { services: typeRegex },
    ],
  };
}

// Get all service providers
router.get('/', async (req, res) => {
  try {
    const serviceTypeRaw = req.query.serviceType;
    const serviceType = Array.isArray(serviceTypeRaw) ? serviceTypeRaw[0] : serviceTypeRaw;
    const { city, location } = req.query;
    const query = { role: 'service_provider', isActive: true };
    const andClauses = [];

    const typeClause = serviceTypeFilter(serviceType);
    if (typeClause) andClauses.push(typeClause);

    const locClause = vetLocationClause(location || city);
    if (locClause) andClauses.push(locClause);

    if (andClauses.length) query.$and = andClauses;

    const providers = await User.find(query)
      .select('name email phone address profileImage services serviceType rating totalReviews')
      .sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
