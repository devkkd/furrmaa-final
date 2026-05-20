import mongoose from 'mongoose';

const cremationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    center: { type: mongoose.Schema.Types.ObjectId, ref: 'CremationCenter' },
    ownerInformation: {
      fullName: { type: String, required: true, trim: true },
      mobileNumber: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    petInformation: {
      petName: { type: String, required: true, trim: true },
      petType: { type: String, enum: ['dog', 'cat', 'other'], required: true },
      petBreed: { type: String, trim: true },
      ageYears: { type: String, trim: true },
      sex: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    },
    pickupLocation: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export default mongoose.model('CremationRequest', cremationRequestSchema);


