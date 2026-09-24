import express from 'express';
import User from '../models/User.model.js';
import { vetLocationClause, preferredCityToken } from '../utils/locationFilter.js';

const router = express.Router();

function serviceTypeFilter(serviceType) {
  const typeStr = String(serviceType).trim();
  if (!typeStr || typeStr === 'All') return null;
  const escaped = typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const typeRegex = new RegExp(`^${escaped}$`, 'i');

  // Hostel / Hotel: match flexible aliases (hourly boarding, not only exact slug)
  const isHostelFamily = /hotel|hostel|boarding/i.test(typeStr);
  if (isHostelFamily) {
    return {
      $or: [
        { serviceType: typeRegex },
        { services: typeRegex },
        { serviceType: { $regex: /hotel|hostel|boarding/i } },
        { services: { $elemMatch: { $regex: /hotel|hostel|boarding/i } } },
      ],
    };
  }

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

    const locRaw = location || city;
    const locClause = vetLocationClause(preferredCityToken(locRaw) || locRaw);
    if (locClause) andClauses.push(locClause);

    if (andClauses.length) query.$and = andClauses;

    const providers = await User.find(query)
      .select('name email phone address profileImage services serviceType rating totalReviews price')
      .lean()
      .sort({ rating: -1, createdAt: -1 });
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
