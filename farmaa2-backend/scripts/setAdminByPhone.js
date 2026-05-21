/**
 * Existing user ko admin banao (e.g. 9999999999)
 * Run: node scripts/setAdminByPhone.js
 */
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.model.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const phone = process.env.ADMIN_PHONE || '9999999999';
    const user = await User.findOne({ phone });
    if (!user) {
      console.log('❌ No user found with phone:', phone);
      process.exit(1);
    }
    user.role = 'admin';
    user.isActive = true;
    user.isVerified = true;
    await user.save();
    console.log('✅ Admin set successfully for:', user.name, phone);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
