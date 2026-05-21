import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const router = express.Router();

/**
 * DEV ONLY ADMIN LOGIN
 */
router.post('/dev-login', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin', isActive: true });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Admin dev login failed'
    });
  }
});

export default router;
