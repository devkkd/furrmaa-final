import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  program: {
    type: String,
    enum: ['basic', 'advanced', 'behavioral', 'agility', 'obedience', 'puppy', 'senior'],
    required: true
  },
  sessions: [{
    date: Date,
    duration: Number, // in minutes
    topics: [String],
    notes: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  amount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Training', trainingSchema);


