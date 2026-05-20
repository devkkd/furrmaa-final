import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VetServiceType from '../models/VetServiceType.model.js';

dotenv.config();

const DEFAULT_TYPES = [
  { name: 'Veterinarians', slug: 'Veterinarians', source: 'veterinarian', order: 1 },
  { name: 'Pet Shops', slug: 'Pet Shops', source: 'service_provider', order: 2 },
  { name: 'Hospitals', slug: 'Hospitals', source: 'service_provider', order: 3 },
  { name: 'Pet Hotels / Hostels', slug: 'Pet Hotels / Hostels', source: 'service_provider', order: 4 },
  { name: 'NGOs', slug: 'NGOs', source: 'service_provider', order: 5 },
  { name: 'Shelters', slug: 'Shelters', source: 'service_provider', order: 6 },
  { name: 'Rescue Centers', slug: 'Rescue Centers', source: 'service_provider', order: 7 },
  { name: 'Pet Cremation', slug: 'Pet Cremation', source: 'cremation', order: 8 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    const count = await VetServiceType.countDocuments();
    if (count > 0) {
      console.log('Vet service types already exist. Skipping seed.');
      process.exit(0);
      return;
    }
    await VetServiceType.insertMany(DEFAULT_TYPES);
    console.log('Seeded', DEFAULT_TYPES.length, 'vet service types.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
