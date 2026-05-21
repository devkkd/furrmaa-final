import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Coupon from '../models/Coupon.model.js';

dotenv.config();

const defaults = [
  { code: 'FURRMAA10', description: '10% off', discountPercent: 10, minOrderAmount: 299 },
  { code: 'PETLOVE15', description: '15% off', discountPercent: 15, minOrderAmount: 499, maxDiscount: 200 },
];

async function seed() {
  await connectDB();
  for (const c of defaults) {
    await Coupon.findOneAndUpdate({ code: c.code }, { ...c, isActive: true }, { upsert: true });
    console.log('Coupon:', c.code);
  }
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
