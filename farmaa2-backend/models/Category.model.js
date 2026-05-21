import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  section: {
    type: String,
    enum: ['everyday', 'wellness', 'all'],
    default: 'all',
  },
  petType: {
    type: [String],
    enum: ['dog', 'cat', 'both'],
    default: ['both'],
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Category', categorySchema);

