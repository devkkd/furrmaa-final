import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'packing',
      'shipped',
      'delivered',
      'cancelled',
      'return_requested',
      'returned',
    ],
    default: 'pending',
  },
  returnReason: String,
  returnRequestedAt: Date,
  couponCode: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  ratingComment: String,
  ratedAt: Date,
  trackingNumber: String,
  notes: String,
  shippingDetails: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    status: String,
    estimatedDelivery: Date,
    lastUpdatedAt: Date,
  },
  zohoShipping: {
    salesOrderId: String,
    salesOrderNumber: String,
    packageId: String,
    shipmentId: String,
    trackingNumber: String,
    trackingUrl: String,
    status: String,
    lastSyncAt: Date,
    syncStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    syncError: String,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date,
  refundCreditedAt: Date,
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);


