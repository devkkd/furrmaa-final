import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const router = express.Router();

// Get all service providers
router.get('/', async (req, res) => {
  try {
    const serviceTypeRaw = req.query.serviceType;
    const serviceType = Array.isArray(serviceTypeRaw) ? serviceTypeRaw[0] : serviceTypeRaw;
    const query = { role: 'service_provider', isActive: true };
    if (serviceType && String(serviceType).trim() !== '' && String(serviceType).trim() !== 'All') {
      const typeStr = String(serviceType).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.services = { $regex: typeStr, $options: 'i' };
    }
    const providers = await User.find(query)
      .select('name email phone address profileImage services rating totalReviews')
      .sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


