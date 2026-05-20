import express from 'express';
import { register, login, getMe, updateMe, sendOTP, verifyOTP } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/** Public flags for web/mobile — which social/OTP UI to use (Firebase vs Auth0). Does not disable APIs. */
router.get('/public-config', (req, res) => {
  res.json({
    success: true,
    useFirebaseAuth: process.env.USE_FIREBASE_AUTH === 'true',
  });
});

// Email/Password Auth
router.post('/register', register);
router.post('/login', login);

// Mobile/OTP Auth
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected Routes
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;


