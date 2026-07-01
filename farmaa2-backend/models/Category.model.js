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
  /** Single scope for unique home/shop tiles: dog | cat | both */
  petScope: {
    type: String,
    enum: ['dog', 'cat', 'both'],
    default: 'both',
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

categorySchema.index({ slug: 1, section: 1, petScope: 1 }, { unique: true });
categorySchema.index({ section: 1, petScope: 1, isActive: 1, displayOrder: 1 });

categorySchema.pre('save', function setPetScope() {
  const types = Array.isArray(this.petType) ? this.petType : [this.petType].filter(Boolean);
  if (types.includes('both') || types.length > 1) this.petScope = 'both';
  else if (types.includes('dog')) this.petScope = 'dog';
  else if (types.includes('cat')) this.petScope = 'cat';
  else this.petScope = 'both';
});

export default mongoose.model('Category', categorySchema);

