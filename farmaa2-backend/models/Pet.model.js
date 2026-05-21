import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['dog', 'cat'],
    required: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown']
  },
  weight: {
    type: Number,
    min: 0
  },
  color: String,
  description: String,
  images: [String],
  medicalHistory: [{
    date: Date,
    condition: String,
    treatment: String,
    veterinarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date
  }],
  isAdopted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Pet', petSchema);


