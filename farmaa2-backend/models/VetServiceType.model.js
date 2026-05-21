import mongoose from 'mongoose';

const vetServiceTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true }, // optional; if empty, name is used for API filter
    source: {
      type: String,
      enum: ['veterinarian', 'service_provider', 'cremation'],
      required: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

vetServiceTypeSchema.index({ order: 1 });

export default mongoose.model('VetServiceType', vetServiceTypeSchema);
