import express from 'express';
import PetEvent from '../models/PetEvent.model.js';
import PetEventRegistration from '../models/PetEventRegistration.model.js';

const router = express.Router();

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "Jaipur, Rajasthan" → match admin event city "Jaipur" */
function locationFilter(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || raw.toLowerCase() === 'all') return null;
  const token = raw.split(',')[0].trim();
  if (!token) return null;
  const re = escapeRegex(token);
  return {
    $or: [
      { city: { $regex: re, $options: 'i' } },
      { venue: { $regex: re, $options: 'i' } },
    ],
  };
}

// List events (location/city + search) — admin-created active events only
router.get('/', async (req, res) => {
  try {
    const { city, location, search } = req.query;
    const query = { isActive: true };
    const locClause = locationFilter(location || city);
    if (locClause) Object.assign(query, locClause);
    if (search) {
      const s = escapeRegex(String(search).trim());
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { venue: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
        ],
      });
    }
    const events = await PetEvent.find(query).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Distinct cities from active events (for optional UI)
router.get('/meta/cities', async (_req, res) => {
  try {
    const cities = await PetEvent.distinct('city', { isActive: true });
    res.json({
      success: true,
      cities: cities.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event detail (must be after /meta/cities)
router.get('/:id', async (req, res) => {
  if (req.params.id === 'meta') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const event = await PetEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register for an event (public)
router.post('/:id/register', async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body || {};
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }
    const event = await PetEvent.findById(req.params.id);
    if (!event || event.isActive === false) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const registration = await PetEventRegistration.create({
      event: event._id,
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone.trim(),
      notes: notes?.trim() || undefined,
    });
    res.status(201).json({ success: true, registration, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


