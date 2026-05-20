import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'premium_plus'],
    default: 'free'
  },
  planType: {
    type: String,
    enum: ['training'],
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentMethod: String,
  lastPaymentAmount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  lastPaymentDate: Date,
  nextBillingDate: Date
}, {
  timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);




