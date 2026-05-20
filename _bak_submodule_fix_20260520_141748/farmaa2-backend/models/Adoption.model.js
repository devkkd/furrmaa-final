import mongoose from 'mongoose';

const adoptionSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  livingSituation: {
    type: String,
    enum: ['house', 'apartment', 'other']
  },
  hasOtherPets: {
    type: Boolean,
    default: false
  },
  experience: String,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Adoption', adoptionSchema);


