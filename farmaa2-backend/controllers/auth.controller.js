import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import firebaseAdmin from '../config/firebase.admin.js';
import { admin } from '../config/firebase.admin.js';
import { sendOTPEmail } from '../utils/email.service.js';
import { sendOtpSms } from '../utils/sms.service.js';

// Helper function to verify Firebase ID token
const verifyFirebaseIdToken = async (idToken) => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin SDK not configured');
  }
  
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase ID token: ' + error.message);
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const normalizePhone = (p) => (p ? String(p).replace(/\D/g, '').slice(-10) : '');

/** Seeded admin identifiers from env (+ common brand spellings). */
export const getSeedAdminConfig = () => {
  const phone = normalizePhone(process.env.ADMIN_PHONE || '9999999999');
  const email = (process.env.ADMIN_EMAIL || 'admin@furmaa.com').toLowerCase().trim();
  const emails = Array.from(
    new Set([email, 'admin@furmaa.com', 'admin@furrmaa.com'].filter(Boolean))
  );
  return {
    phone,
    emails,
    password: process.env.ADMIN_PASSWORD || 'admin123',
    otp: process.env.ADMIN_OTP || '787878',
    name: process.env.ADMIN_NAME || 'Admin User',
  };
};

export const isSeedAdminIdentifier = (email, phone) => {
  const cfg = getSeedAdminConfig();
  const emailNorm = email ? String(email).toLowerCase().trim() : '';
  const phoneNorm = phone ? normalizePhone(phone) : '';
  return (
    (emailNorm && cfg.emails.includes(emailNorm)) ||
    (phoneNorm && phoneNorm === cfg.phone)
  );
};

const formatAuthUser = (user, phoneFallback, emailFallback) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || phoneFallback || null,
  role: user.role || 'user',
  isVerified: user.isVerified,
  firebaseUid: user.firebaseUid || null,
});

/** Find or create seeded admin user (no Firebase / SMTP). */
const ensureSeedAdminUser = async ({ email, phone }) => {
  const cfg = getSeedAdminConfig();
  const emailNorm = email ? String(email).toLowerCase().trim() : cfg.emails[0];
  const phoneNorm = phone ? normalizePhone(phone) : cfg.phone;

  let user = await User.findOne({
    $or: [
      { email: { $in: cfg.emails } },
      { phone: cfg.phone },
      ...(emailNorm ? [{ email: emailNorm }] : []),
      ...(phoneNorm ? [{ phone: phoneNorm }] : []),
    ],
  }).select('+password');

  if (!user) {
    user = await User.create({
      name: cfg.name,
      email: emailNorm || cfg.emails[0],
      phone: phoneNorm || cfg.phone,
      password: cfg.password,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
  } else {
    user.name = cfg.name;
    user.role = 'admin';
    user.isVerified = true;
    user.isActive = true;
    if (!user.email) user.email = emailNorm || cfg.emails[0];
    if (!user.phone) user.phone = phoneNorm || cfg.phone;
    user.password = cfg.password;
    await user.save();
  }

  return user;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (omit firebaseUid when absent — sparse unique index still indexes explicit null → E11000)
    const { firebaseUid } = req.body;
    const userPayload = {
      name,
      email,
      password,
      phone,
      role: role || 'user',
    };
    if (firebaseUid) userPayload.firebaseUid = firebaseUid;
    const user = await User.create(userPayload);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, phone, password, firebaseUid, firebaseToken, name: displayNameFromBody } = req.body;

    // If Firebase ID token is provided, verify and login
    if (firebaseToken) {
      try {
        const decodedToken = await verifyFirebaseIdToken(firebaseToken);
        const firebaseUidFromToken = decodedToken.uid;
        const emailFromToken = decodedToken.email;
        const phoneFromToken = decodedToken.phone_number;
        
        // Find or create user
        let user = await User.findOne({ firebaseUid: firebaseUidFromToken });
        
        if (!user) {
          // Try to find by email or phone
          if (emailFromToken) {
            user = await User.findOne({ email: emailFromToken });
          } else if (phoneFromToken) {
            const normalized = String(phoneFromToken).replace(/\D/g, '').slice(-10);
            const phoneVariants = Array.from(
              new Set([phoneFromToken, normalized, normalized ? `+91${normalized}` : ''].filter(Boolean))
            );
            user = await User.findOne({ phone: { $in: phoneVariants } });
          }
          
          if (user) {
            // Update existing user with Firebase UID
            user.firebaseUid = firebaseUidFromToken;
            if (!user.email && emailFromToken) user.email = emailFromToken;
            if (!user.phone && phoneFromToken) user.phone = phoneFromToken;
            user.isVerified = true;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: (typeof displayNameFromBody === 'string' && displayNameFromBody.trim())
                ? displayNameFromBody.trim()
                : (decodedToken.name || emailFromToken?.split('@')[0] || phoneFromToken || 'User'),
              email: emailFromToken || `${firebaseUidFromToken}@firebase.com`,
              password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
              phone: phoneFromToken || null,
              firebaseUid: firebaseUidFromToken,
              isVerified: true,
            });
          }
        }
        
        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is inactive'
          });
        }
        
        const token = generateToken(user._id);
        const userResponse = {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || phoneFromToken || null,
          role: user.role || 'user',
          firebaseUid: user.firebaseUid
        };
        
        return res.json({
          success: true,
          message: 'Firebase authentication successful',
          token,
          user: userResponse
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message || 'Firebase authentication failed'
        });
      }
    }

    // If Firebase UID is provided (legacy support), find user by Firebase UID
    if (firebaseUid) {
      let user = await User.findOne({ firebaseUid });
      
      if (!user) {
        // If user doesn't exist with Firebase UID, try to find by email/phone
        if (email) {
          user = await User.findOne({ email });
        } else if (phone) {
          user = await User.findOne({ phone });
        }
        
        // If user found, update Firebase UID
        if (user) {
          user.firebaseUid = firebaseUid;
          await user.save();
        } else {
          return res.status(401).json({
            success: false,
            message: 'User not found. Please register first.'
          });
        }
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      const token = generateToken(user._id);
      const userResponse = {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || phone || email,
        role: user.role || 'user',
        firebaseUid: user.firebaseUid
      };

      return res.json({
        success: true,
        token,
        user: userResponse
      });
    }

    // Regular email/password login
    // Validate credentials
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Check for user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email }).select('+password');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const token = generateToken(user._id);

    // Ensure role is included in response
    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || phone || email,
      role: user.role || 'user',
      firebaseUid: user.firebaseUid || null
    };
    
    console.log('🔐 Login response user:', userResponse);

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Seeded admin login — no SMTP, no Firebase
// @route   POST /api/auth/seed-login
// @access  Public
export const seedAdminLogin = async (req, res) => {
  try {
    let { email, phone, password, otp } = req.body || {};
    if (phone) phone = normalizePhone(phone);
    if (email) email = String(email).toLowerCase().trim();

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Provide seed admin email or phone',
      });
    }

    if (!isSeedAdminIdentifier(email, phone)) {
      return res.status(403).json({
        success: false,
        message: 'Not a seeded admin account',
      });
    }

    const cfg = getSeedAdminConfig();
    const secret = String(password || otp || '').trim();
    if (!secret || (secret !== cfg.password && secret !== cfg.otp)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password or OTP',
      });
    }

    const user = await ensureSeedAdminUser({ email, phone });
    const token = generateToken(user._id);

    console.log('🔑 Seed admin login (no SMTP/Firebase):', user.email || user.phone);

    return res.json({
      success: true,
      message: 'Seed admin login successful',
      token,
      user: formatAuthUser(user, phone, email),
    });
  } catch (error) {
    console.error('❌ seedAdminLogin error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Seed admin login failed',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('pets');

    // Return user with all fields including role
    const userResponse = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'user',
      isVerified: user.isVerified,
      isActive: user.isActive,
      pets: user.pets,
      address: user.address,
      profileImage: user.profileImage
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update current user profile (e.g. sync name/email/picture from Auth0/Google)
// @route   PATCH /api/auth/me
// @access  Private
export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { name, email, profileImage } = req.body;
    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (email && typeof email === 'string' && email.trim()) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const existing = await User.findOne({ email: newEmail });
        if (!existing) user.email = newEmail;
      }
    }
    if (profileImage && typeof profileImage === 'string' && profileImage.trim()) {
      user.profileImage = profileImage.trim();
    }
    await user.save();
    const userResponse = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'user',
      isVerified: user.isVerified,
      isActive: user.isActive,
      profileImage: user.profileImage
    };
    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to mobile number or email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    let { phone, email } = req.body;
    if (phone) phone = normalizePhone(phone);

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a phone number or email address'
      });
    }

    if (phone && phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number (minimum 10 digits)'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    let otp;
    let expiresAt;
    const otpType = email ? 'email' : 'phone';
    const identifier = email || phone;
    const cfg = getSeedAdminConfig();
    const emailNorm = email ? email.toLowerCase().trim() : '';
    const isAdminRequest = isSeedAdminIdentifier(emailNorm, phone);
    const devOtp = cfg.otp;

    if (process.env.NODE_ENV === 'development' && phone) {
      otp = devOtp;
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      console.log(`🔑 Dev OTP for ${phone}: ${otp}`);
    } else if (isAdminRequest) {
      const query = emailNorm
        ? { email: emailNorm, verified: false }
        : { phone: cfg.phone, verified: false };
      const existingOTP = await OTP.findOne(query);
      if (existingOTP && new Date() < existingOTP.expiresAt) {
        otp = existingOTP.otp;
        expiresAt = existingOTP.expiresAt;
      } else {
        otp = devOtp;
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      console.log(`🔑 Seed admin OTP for ${identifier}: ${otp}`);
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    }

    const otpData = {
      otp,
      expiresAt,
      verified: false,
      type: otpType,
    };

    if (email) otpData.email = emailNorm;
    else otpData.phone = phone;

    const query = email ? { email: emailNorm } : { phone };
    await OTP.findOneAndUpdate(query, { $set: otpData }, { upsert: true, new: true });

    // Seeded admin: never touch SMTP / SMS / Firebase
    if (isAdminRequest) {
      return res.json({
        success: true,
        message: 'Admin OTP ready (seed). SMTP/Firebase skipped.',
        seedAdmin: true,
        otp,
      });
    }

    if (email) {
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent && process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please check email configuration.'
        });
      }
      console.log(`📧 OTP sent to email: ${email}`);
    } else {
      const sms = await sendOtpSms(phone, otp);
      if (sms.sent) {
        console.log(`📱 OTP SMS sent (${sms.provider}) → ${phone}`);
      } else if (sms.error === 'no_sms_provider') {
        console.log(`📱 OTP for ${phone}: ${otp} — SMS env nahi. Yahi OTP use karo.`);
      } else {
        console.error(`📱 SMS failed for ${phone}:`, sms.error);
        console.log(`📱 OTP for ${phone}: ${otp} — SMS failed, use manually`);
      }
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${otpType === 'email' ? 'email' : 'mobile'}`,
      otp:
        process.env.NODE_ENV === 'development' ||
        (!process.env.MSG91_AUTHKEY && !process.env.TWILIO_ACCOUNT_SID)
          ? otp
          : undefined,
    });
  } catch (error) {
    console.error('❌ Error in sendOTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.'
    });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    let { phone, email, otp, name, firebaseUid } = req.body;
    if (phone) phone = normalizePhone(phone);

    // Validate input
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide OTP'
      });
    }

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either phone number or email address'
      });
    }

    // Find OTP record: prefer unverified, in dev allow re-use of same OTP
    let otpRecord = null;
    if (email) {
      otpRecord = await OTP.findOne({ email: email.toLowerCase().trim(), verified: false })
        .sort({ createdAt: -1 });
    } else {
      otpRecord = await OTP.findOne({ phone, verified: false }).sort({ createdAt: -1 });
      // Dev: agar already used hai to bhi same OTP + not expired allow karo (787878 reuse)
      if (!otpRecord && process.env.NODE_ENV === 'development' && phone) {
        const anyByPhone = await OTP.findOne({ phone }).sort({ createdAt: -1 });
        if (anyByPhone && anyByPhone.otp === otp.toString() && new Date() <= anyByPhone.expiresAt) {
          otpRecord = anyByPhone;
          console.log('🔑 Dev: Reusing OTP for phone', phone);
        }
      }
    }

    const cfg = getSeedAdminConfig();
    const emailNorm = email ? email.toLowerCase().trim() : '';
    const isAdminLogin = isSeedAdminIdentifier(emailNorm, phone);
    const secret = String(otp || '').trim();

    // Seeded admin: allow fixed ADMIN_OTP or ADMIN_PASSWORD without SMTP/Firebase OTP record
    if (isAdminLogin && (secret === cfg.otp || secret === cfg.password)) {
      const user = await ensureSeedAdminUser({ email: emailNorm, phone });
      const token = generateToken(user._id);
      console.log('🔑 Seed admin verify (no SMTP/Firebase):', user.email || user.phone);
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: formatAuthUser(user, phone, emailNorm),
      });
    }

    if (!otpRecord) {
      if (phone) {
        const anyOtp = await OTP.findOne({ phone }).sort({ createdAt: -1 });
        if (anyOtp) {
          console.log('⚠️ OTP found but already verified or expired. Phone:', phone);
        } else {
          console.log('⚠️ No OTP record for phone:', phone, '- request Send OTP first.');
        }
      }
      return res.status(400).json({
        success: false,
        message: 'OTP not found or already used. Please request a new OTP.'
      });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create user
    const identifier = email ? email.toLowerCase().trim() : phone;
    const userQuery = email ? { email: identifier } : { phone: identifier };
    let user = await User.findOne(userQuery);

    if (!user) {
      // Create new user — do not set firebaseUid: null (MongoDB unique sparse still conflicts on null)
      const userData = {
        name: name || (email ? email.split('@')[0] : `User ${phone.slice(-4)}`),
        email: email || `${phone}@furmaa.com`,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random secure password
        isVerified: true,
        role: isAdminLogin ? 'admin' : 'user',
      };

      if (phone) userData.phone = phone;
      if (firebaseUid) userData.firebaseUid = firebaseUid;

      user = await User.create(userData);
      console.log(`✅ New user created via OTP: ${email || phone}${isAdminLogin ? ' (admin)' : ''}`);
    } else {
      // Update existing user
      user.isVerified = true;
      if (isAdminLogin) user.role = 'admin';
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
      // Update phone if provided and not set
      if (phone && !user.phone) {
        user.phone = phone;
      }
      // Update email if provided and different
      if (email && user.email !== email.toLowerCase().trim()) {
        // Check if email is already taken by another user
        const emailUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (!emailUser) {
          user.email = email.toLowerCase().trim();
        }
      }
      await user.save();
      console.log(`✅ User verified via OTP: ${email || phone}`);
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user response
    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || phone || null,
      role: user.role || 'user',
      isVerified: user.isVerified,
      firebaseUid: user.firebaseUid || null
    };
    
    console.log('🔐 OTP verify successful for:', email || phone);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Error in verifyOTP:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP. Please try again.'
    });
  }
};


