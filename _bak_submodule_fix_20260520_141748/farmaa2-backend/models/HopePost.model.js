import mongoose from 'mongoose';

const hopePostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postType: { type: String, enum: ['adoption', 'lostFound'], required: true },
    petType: { type: String, enum: ['dog', 'cat'], required: true },
    petName: { type: String, required: true, trim: true },
    petAgeText: { type: String, trim: true },
    locationText: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [String],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    reportsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('HopePost', hopePostSchema);


