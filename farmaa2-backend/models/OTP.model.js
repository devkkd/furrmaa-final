import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: function() {
      return !this.email; // Required if email is not provided
    },
    index: true,
  },
  email: {
    type: String,
    required: function() {
      return !this.phone; // Required if phone is not provided
    },
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['phone', 'email'],
    required: true,
    default: function() {
      return (this && this.email) ? 'email' : 'phone';
    },
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Validation: Either phone or email must be provided
otpSchema.pre('validate', function(next) {
  if (!this) {
    if (typeof next === 'function') next();
    return;
  }
  if (!this.phone && !this.email) {
    const err = new Error('Either phone or email must be provided');
    if (typeof next === 'function') next(err);
    else throw err;
    return;
  }
  if (typeof next === 'function') next();
});

// Compound indexes for phone and email queries
otpSchema.index({ phone: 1, verified: 1 });
otpSchema.index({ email: 1, verified: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OTP', otpSchema);


