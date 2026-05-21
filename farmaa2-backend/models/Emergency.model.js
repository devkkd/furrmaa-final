import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  type: {
    type: String,
    enum: ['medical', 'lost', 'accident', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  assignedVeterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseTime: Date,
  resolutionNotes: String
}, {
  timestamps: true
});

export default mongoose.model('Emergency', emergencySchema);


