import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  sendOTP,
  verifyOTP,
  seedAdminLogin,
  getSeedAdminConfig,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/** Public flags for web/mobile — which social/OTP UI to use (Firebase vs Auth0). Does not disable APIs. */
router.get('/public-config', (req, res) => {
  const seed = getSeedAdminConfig();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    success: true,
    useFirebaseAuth: process.env.USE_FIREBASE_AUTH === 'true',
    // Identifiers only — never expose password/OTP here
    seedAdmin: {
      emails: seed.emails,
      phone: seed.phone,
    },
  });
});

// Email/Password Auth
router.post('/register', register);
router.post('/login', login);
/** Seeded admin — no SMTP / Firebase */
router.post('/seed-login', seedAdminLogin);

// Mobile/OTP Auth
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected Routes
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;
