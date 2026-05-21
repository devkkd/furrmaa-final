import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['feeding', 'medication', 'grooming', 'vaccination', 'vet_visit', 'exercise', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // Store time as string like "08:00" or "08:00 AM"
    required: true
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
reminderSchema.index({ user: 1, date: 1, enabled: 1 });

export default mongoose.model('Reminder', reminderSchema);








