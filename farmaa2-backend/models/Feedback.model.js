import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: String,
  userType: { type: String, trim: true }, // Contact form: Pet Parent, Service Provider, etc.
  type: {
    type: String,
    enum: ['bug', 'feature', 'suggestion', 'complaint', 'other', 'contact', 'testimonial'],
    default: 'other'
  },
  /** Short headline shown on homepage cards */
  subject: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    trim: true,
    default: 'Pet Parent'
  },
  featured: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending'
  },
  adminResponse: String,
  respondedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);




