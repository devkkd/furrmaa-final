import mongoose from 'mongoose';

const trainingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  completedVideoIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingVideo',
  }],
}, { timestamps: true });

export default mongoose.model('TrainingProgress', trainingProgressSchema);
