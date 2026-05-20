import mongoose from 'mongoose';

const petEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dateText: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    posterUrl: { type: String, trim: true },
    images: [String],
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('PetEvent', petEventSchema);


