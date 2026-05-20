import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  preferences: {
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);




