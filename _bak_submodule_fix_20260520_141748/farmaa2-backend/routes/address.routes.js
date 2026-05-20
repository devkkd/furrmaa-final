import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Address from '../models/Address.model.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single address
router.get('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create address
router.post('/', async (req, res) => {
  try {
    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ success: true, address });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await address.deleteOne();
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set default address
router.put('/:id/default', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Unset all other defaults
    await Address.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;




