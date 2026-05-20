import firebaseAdmin from '../config/firebase.admin.js';
import User from '../models/User.model.js';

/**
 * Verify Firebase ID Token and attach user to request
 * Use this middleware for Firebase Authentication
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get Firebase ID token from Authorization header
    let idToken;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      idToken = req.headers.authorization.split(' ')[1];
    } else if (req.body.firebaseToken) {
      idToken = req.body.firebaseToken;
    }

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token not provided'
      });
    }

    // Check if Firebase Admin SDK is initialized
    if (!firebaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin SDK not configured'
      });
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      
      // Get user info from decoded token
      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email;
      const phoneNumber = decodedToken.phone_number;
      
      // Find or create user in database
      let user = await User.findOne({ firebaseUid });
      
      if (!user) {
        // Try to find by email or phone
        if (email) {
          user = await User.findOne({ email });
        } else if (phoneNumber) {
          user = await User.findOne({ phone: phoneNumber });
        }
        
        if (user) {
          // Update existing user with Firebase UID
          user.firebaseUid = firebaseUid;
          if (!user.email && email) user.email = email;
          if (!user.phone && phoneNumber) user.phone = phoneNumber;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name: decodedToken.name || email?.split('@')[0] || phoneNumber || 'User',
            email: email || `${firebaseUid}@firebase.com`,
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password
            phone: phoneNumber || null,
            firebaseUid: firebaseUid,
            isVerified: true,
          });
        }
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
      }
      
      // Attach user and Firebase info to request
      req.user = user;
      req.firebaseUid = firebaseUid;
      req.decodedToken = decodedToken;
      
      next();
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase ID token'
      });
    }
  } catch (error) {
    console.error('Firebase middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Firebase authentication'
    });
  }
};

/**
 * Verify Firebase ID Token and generate backend JWT
 * Use this for login/register endpoints
 */
export const verifyFirebaseAndGenerateJWT = async (req, res, next) => {
  try {
    await verifyFirebaseToken(req, res, () => {
      // After Firebase verification, JWT will be generated in controller
      next();
    });
  } catch (error) {
    next(error);
  }
};









