import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    petContext: {
      petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
      },
      petType: String,
      petName: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
aiChatSchema.index({ user: 1, createdAt: -1 });
// sessionId already has unique index from schema definition

export default mongoose.model('AIChat', aiChatSchema);


