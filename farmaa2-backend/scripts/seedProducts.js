import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model.js';

dotenv.config();

const products = [
  {
    name: 'Canine Creek Club Ultra Premium Dry Dog Food',
    description: 'Premium dry dog food with high protein content, vitamins, and minerals. Perfect for adult dogs of all breeds.',
    category: 'food',
    petType: ['dog'],
    price: 2449,
    discountPrice: 2229,
    stock: 50,
    brand: 'Canine Creek',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'],
    isActive: true,
  },
  {
    name: 'Royal Canin Adult Cat Food',
    description: 'Complete nutrition for adult cats. Balanced diet with essential nutrients for healthy growth.',
    category: 'food',
    petType: ['cat'],
    price: 1899,
    discountPrice: 1699,
    stock: 40,
    brand: 'Royal Canin',
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'],
    isActive: true,
  },
  {
    name: 'Interactive Dog Toy Ball',
    description: 'Durable rubber ball for dogs. Perfect for fetch and playtime. Non-toxic and safe.',
    category: 'toys',
    petType: ['dog'],
    price: 299,
    discountPrice: 249,
    stock: 100,
    brand: 'PetPlay',
    rating: 4.3,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Scratching Post with Toys',
    description: 'Multi-level scratching post with hanging toys. Keeps your cat entertained and protects furniture.',
    category: 'toys',
    petType: ['cat'],
    price: 1299,
    discountPrice: 999,
    stock: 30,
    brand: 'CatZone',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500'],
    isActive: true,
  },
  {
    name: 'Leather Dog Collar with Name Tag',
    description: 'Premium leather collar with adjustable size. Includes engraved name tag. Available in multiple colors.',
    category: 'accessories',
    petType: ['dog'],
    price: 599,
    discountPrice: 499,
    stock: 75,
    brand: 'PetStyle',
    rating: 4.4,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Collar with Bell',
    description: 'Adjustable cat collar with safety bell. Breakaway design for safety. Multiple colors available.',
    category: 'accessories',
    petType: ['cat'],
    price: 349,
    discountPrice: 299,
    stock: 60,
    brand: 'PetStyle',
    rating: 4.2,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'],
    isActive: true,
  },
  {
    name: 'Professional Dog Grooming Kit',
    description: 'Complete grooming kit with brush, comb, nail clipper, and shampoo. Everything you need for pet grooming.',
    category: 'grooming',
    petType: ['dog'],
    price: 1499,
    discountPrice: 1199,
    stock: 25,
    brand: 'GroomPro',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Grooming Brush',
    description: 'Gentle brush for cat grooming. Removes loose hair and prevents matting. Comfortable for your cat.',
    category: 'grooming',
    petType: ['cat'],
    price: 399,
    discountPrice: 349,
    stock: 80,
    brand: 'GroomPro',
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500'],
    isActive: true,
  },
  {
    name: 'Dog Health Supplements - Multivitamin',
    description: 'Daily multivitamin supplement for dogs. Supports immune system, joint health, and overall wellness.',
    category: 'health',
    petType: ['dog'],
    price: 799,
    discountPrice: 699,
    stock: 45,
    brand: 'PetHealth',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Dental Care Treats',
    description: 'Dental care treats that help reduce tartar and freshen breath. Made with natural ingredients.',
    category: 'health',
    petType: ['cat'],
    price: 449,
    discountPrice: 399,
    stock: 55,
    brand: 'PetHealth',
    rating: 4.4,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'],
    isActive: true,
  },
  {
    name: 'Orthopedic Dog Bed',
    description: 'Comfortable orthopedic bed for dogs. Supports joints and provides restful sleep. Machine washable.',
    category: 'bedding',
    petType: ['dog'],
    price: 2499,
    discountPrice: 1999,
    stock: 20,
    brand: 'ComfortPet',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500'],
    isActive: true,
  },
  {
    name: 'Cozy Cat Bed with Cushion',
    description: 'Soft and warm cat bed with removable cushion. Perfect for indoor cats. Easy to clean.',
    category: 'bedding',
    petType: ['cat'],
    price: 1299,
    discountPrice: 999,
    stock: 35,
    brand: 'ComfortPet',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500'],
    isActive: true,
  },
  {
    name: 'Dog Training Treats - Chicken Flavor',
    description: 'High-value training treats for dogs. Small size perfect for training sessions. Made with real chicken.',
    category: 'food',
    petType: ['dog'],
    price: 249,
    discountPrice: 199,
    stock: 90,
    brand: 'TrainRight',
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Litter Box with Cover',
    description: 'Large covered litter box with odor control. Includes scoop and mat. Easy to clean design.',
    category: 'other',
    petType: ['cat'],
    price: 899,
    discountPrice: 749,
    stock: 40,
    brand: 'CleanCat',
    rating: 4.3,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'],
    isActive: true,
  },
  {
    name: 'Dog Leash - Retractable 5m',
    description: 'Retractable dog leash with comfortable handle. Extends up to 5 meters. One-button brake system.',
    category: 'accessories',
    petType: ['dog'],
    price: 699,
    discountPrice: 599,
    stock: 65,
    brand: 'WalkEasy',
    rating: 4.4,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500'],
    isActive: true,
  },
  {
    name: 'Cat Food Bowl Set - Stainless Steel',
    description: 'Set of 2 stainless steel bowls for cats. Non-slip base. Dishwasher safe and easy to clean.',
    category: 'accessories',
    petType: ['cat'],
    price: 449,
    discountPrice: 399,
    stock: 70,
    brand: 'PetDine',
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'],
    isActive: true,
  },
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furmaa');
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${insertedProducts.length} products successfully`);

    // Display summary
    const categories = {};
    insertedProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    console.log('\n📊 Products by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();



