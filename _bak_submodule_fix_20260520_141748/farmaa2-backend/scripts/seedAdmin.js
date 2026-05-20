import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';

dotenv.config();

const normalizePhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@furmaa.com').toLowerCase().trim();
    const adminPhone = normalizePhone(process.env.ADMIN_PHONE || '8888888888');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminOTP = process.env.ADMIN_OTP || '787878';
    const otpExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    let user = await User.findOne({
      $or: [{ email: adminEmail }, { phone: adminPhone }],
    });

    if (user) {
      user.name = adminName;
      user.email = adminEmail;
      user.phone = adminPhone;
      user.role = 'admin';
      user.isVerified = true;
      user.isActive = true;
      if (adminPassword) user.password = adminPassword;
      await user.save();
      console.log('✅ Existing user promoted to admin');
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      console.log('✅ Admin user created');
    }

    await OTP.findOneAndUpdate(
      { phone: adminPhone },
      {
        phone: adminPhone,
        otp: adminOTP,
        type: 'phone',
        expiresAt: otpExpiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    await OTP.findOneAndUpdate(
      { email: adminEmail },
      {
        email: adminEmail,
        otp: adminOTP,
        type: 'email',
        expiresAt: otpExpiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', user.email);
    console.log('📱 Phone:', user.phone);
    console.log('🔑 Password (email login):', adminPassword);
    console.log('🔑 OTP (app login):', adminOTP);
    console.log('👤 Role:', user.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('App: More tab → Admin Panel sirf is account se dikhega.');
    console.log('Dusre phone/email se login = normal user (admin nahi).');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
