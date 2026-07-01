import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI); // debug

const normalizePhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@farmaa.com').toLowerCase().trim();
    const adminPhone = normalizePhone(process.env.ADMIN_PHONE || '9999999999');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { phone: adminPhone }]
    });

    if (admin) {
      admin.name = adminName;
      admin.email = adminEmail;
      admin.phone = adminPhone;
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.isVerified = true;
      admin.isActive = true;
      await admin.save();
      console.log('✅ Admin updated successfully');
      process.exit();
    }

    await User.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Admin created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

makeAdmin();
