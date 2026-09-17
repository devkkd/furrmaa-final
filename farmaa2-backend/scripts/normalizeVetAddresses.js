/**
 * One-time: normalize veterinarian address.city/state for Nearby matching.
 * Run: node scripts/normalizeVetAddresses.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import { normalizeVetAddress } from '../utils/locationFilter.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const vets = await User.find({ role: 'veterinarian', address: { $exists: true } });
  let updated = 0;
  for (const vet of vets) {
    if (!vet.address) continue;
    const next = normalizeVetAddress(vet.address.toObject?.() || vet.address);
    const prevCity = vet.address.city;
    const prevState = vet.address.state;
    if (next.city !== prevCity || next.state !== prevState) {
      vet.address = next;
      await vet.save();
      updated += 1;
      console.log(`Updated ${vet.name}: city "${prevCity}" → "${next.city}"`);
    }
  }
  console.log(`Done. Normalized ${updated} / ${vets.length} veterinarians.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
