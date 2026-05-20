import mongoose from 'mongoose';

const exploreContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'tip', 'guide', 'news', 'event'],
    required: true
  },
  image: String,
  videoUrl: String,
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['health', 'care', 'training', 'nutrition', 'grooming', 'behavior', 'adoption', 'general'],
    required: true
  },
  petType: {
    type: [String],
    enum: ['dog', 'cat', 'both'],
    default: ['both']
  },
  author: {
    type: String,
    default: 'Furrmaa Team'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ExploreContent', exploreContentSchema);




