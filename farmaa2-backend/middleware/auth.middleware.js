import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/User.model.js';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const isAuth0Configured = AUTH0_DOMAIN && AUTH0_AUDIENCE;

let jwksClientInstance;
if (isAuth0Configured) {
  jwksClientInstance = jwksClient({
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    cacheMaxAge: 600000,
  });
}

function getAuth0SigningKey(header, callback) {
  if (!jwksClientInstance) return callback(new Error('Auth0 not configured'));
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.publicKey || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

function verifyAuth0Token(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getAuth0SigningKey, {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

/** Auth0 userinfo se name, email lao (Google se aata hai) */
async function getAuth0UserInfo(accessToken) {
  const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Auth0 SMS sub se phone nikaalo: "sms|+919876543210" -> "9876543210" */
function phoneFromAuth0Sub(sub) {
  if (!sub || !sub.startsWith('sms|')) return null;
  const raw = sub.replace(/^sms\|/, '').replace(/\D/g, '');
  return raw.slice(-10) || null; // last 10 digits (India)
}

/** User-uploaded Cloudinary URL — Auth0/Google se overwrite mat karo */
function isUserUploadedProfileImage(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  return u.includes('cloudinary.com') || u.includes('res.cloudinary');
}

async function findOrCreateUserFromAuth0(decoded, userinfo = null) {
  const sub = decoded.sub;
  const isSms = sub.startsWith('sms|');
  const normalizedPhone = isSms ? phoneFromAuth0Sub(sub) : null;

  const email = (userinfo?.email || decoded.email || '').trim()
    || (normalizedPhone ? `${normalizedPhone}@auth0.sms` : null)
    || `${sub.replace(/\|/g, '-')}@auth0.user`;
  const name = (userinfo?.name || userinfo?.nickname || decoded.name || decoded.nickname || '').trim()
    || (normalizedPhone ? `User` : email.split('@')[0])
    || 'User';
  const picture = userinfo?.picture || null;

  let user = await User.findOne({ auth0Id: sub });
  if (user) {
    if (!user.isActive) return null;
    if (userinfo && (userinfo.name || userinfo.email || userinfo.phone_number)) {
      if (userinfo.name && userinfo.name.trim()) user.name = userinfo.name.trim();
      if (userinfo.email && userinfo.email.trim()) user.email = userinfo.email.trim().toLowerCase();
      if (userinfo.picture && !isUserUploadedProfileImage(user.profileImage)) {
        user.profileImage = userinfo.picture;
      }
      if (userinfo.phone_number) {
        const p = userinfo.phone_number.replace(/\D/g, '').slice(-10);
        if (p) user.phone = p;
      }
      await user.save();
    }
    if (isSms && normalizedPhone && !user.phone) {
      user.phone = normalizedPhone;
      await user.save();
    }
    return user;
  }

  if (normalizedPhone) {
    user = await User.findOne({ phone: normalizedPhone });
    if (user) {
      user.auth0Id = sub;
      user.isVerified = true;
      if (!user.phone) user.phone = normalizedPhone;
      await user.save();
      return user;
    }
  }

  user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.auth0Id = sub;
    user.isVerified = true;
    if (name && name.trim()) user.name = name.trim();
    if (userinfo?.picture && !isUserUploadedProfileImage(user.profileImage)) {
      user.profileImage = userinfo.picture;
    }
    if (normalizedPhone && !user.phone) user.phone = normalizedPhone;
    await user.save();
    return user;
  }

  user = await User.create({
    name: name.trim() || 'User',
    email: email.toLowerCase(),
    password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12),
    auth0Id: sub,
    isVerified: true,
    role: 'user',
    ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    ...(picture ? { profileImage: picture } : {}),
  });
  return user;
}

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (isAuth0Configured) {
      try {
        const decoded = await verifyAuth0Token(token);
        const userinfo = await getAuth0UserInfo(token);
        const user = await findOrCreateUserFromAuth0(decoded, userinfo);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
          });
        }
        req.user = user;
        return next();
      } catch (_) {
        // Auth0 verify failed – try our own JWT below
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
        });
      }
      req.user = user;
      return next();
    } catch (_) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
