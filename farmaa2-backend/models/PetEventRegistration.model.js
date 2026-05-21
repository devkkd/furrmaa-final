import mongoose from 'mongoose';

const petEventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PetEvent',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model('PetEventRegistration', petEventRegistrationSchema);
