import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
    // Dynamic: slug from Category collection (admin adds categories)
  },
  petType: {
    type: [String],
    enum: ['dog', 'cat', 'both'],
    default: ['both']
  },
  age: {
    type: String,
    enum: ['puppy', 'young', 'adult', 'senior', 'all'],
    default: 'all'
  },
  size: {
    type: String,
    trim: true
    // slug from ProductSize (admin adds sizes)
  },
  dietaryNeeds: {
    type: [String],
    default: []
    // slugs from ProductDietary (admin adds dietary options)
  },
  breeds: {
    type: [String],
    default: []
    // selected dog breeds: Labrador, Golden Retriever, etc.
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  images: [String],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  brand: String,
  // Item details (admin fills when adding product – show on product detail page)
  unitCount: { type: String, default: '' },
  numberOfItems: { type: String, default: '1' },
  itemWeight: { type: String, default: '' },
  brandName: { type: String, default: '' },
  flavor: { type: String, default: '' },
  ageRange: { type: String, default: '' },
  itemForm: { type: String, default: '' },
  specialIngredients: { type: String, default: '' },
  asin: { type: String, default: '' },
  itemHSN: { type: String, default: '' },
  itemHeight: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  manufacturerContactInfo: { type: String, default: '' },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);


