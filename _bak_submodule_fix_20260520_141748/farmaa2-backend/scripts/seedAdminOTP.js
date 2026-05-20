import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import OTP from '../models/OTP.model.js';

dotenv.config();

const seedAdminOTP = async () => {
  try {
    // Connect to database
    await connectDB();

    // Admin phone number
    const adminPhone = process.env.ADMIN_PHONE || '8888888888';
    
    // Fixed OTP for admin (easy to remember)
    const adminOTP = process.env.ADMIN_OTP || '123456';
    
    // OTP expires in 24 hours (for development)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create or update OTP
    await OTP.findOneAndUpdate(
      { phone: adminPhone },
      {
        phone: adminPhone,
        otp: adminOTP,
        type: 'phone',
        expiresAt: expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin OTP seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Phone:', adminPhone);
    console.log('🔑 OTP:', adminOTP);
    console.log('⏰ Expires At:', expiresAt.toLocaleString('en-IN'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Ab aap is OTP se login kar sakte ho!');
    console.log('⚠️  Development ke liye ye OTP 24 hours tak valid rahega');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin OTP:', error.message);
    process.exit(1);
  }
};

seedAdminOTP();


