import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI); // debug

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const adminEmail = 'admin@farmaa.com';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'admin123',
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
