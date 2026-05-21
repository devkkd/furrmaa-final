/**
 * One-time: fix products where images[] stored Cloudinary objects instead of URL strings.
 * Run: node scripts/fixProductImages.js
 */
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.model.js';
import { normalizeProductImageUrls } from '../utils/productImages.js';

dotenv.config();

async function main() {
  await connectDB();
  const products = await Product.find({});
  let updated = 0;
  for (const product of products) {
    const normalized = normalizeProductImageUrls(product.images);
    const before = JSON.stringify(product.images || []);
    const after = JSON.stringify(normalized);
    if (before !== after) {
      product.images = normalized;
      await product.save();
      updated += 1;
      console.log('Fixed:', product.name, normalized[0]?.slice(0, 60));
    }
  }
  console.log(`Done. Updated ${updated} / ${products.length} products.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
