import mongoose from 'mongoose';

const trainingVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: String,
  // Course category mapping: 'basic', 'intermediate', 'advanced' -> 'Basic Training', 'Intermediate Training', 'Advanced Training'
  category: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced', 'behavioral', 'agility', 'obedience', 'puppy', 'senior', 'tricks'],
    required: true,
    index: true
  },
  // Course level for display
  courseLevel: {
    type: String,
    enum: ['Basic Training', 'Intermediate Training', 'Advanced Training', 'Behavioral Training', 'Agility Training', 'Obedience Training', 'Puppy Training', 'Senior Training', 'Tricks Training'],
    default: function() {
      const categoryMap = {
        'basic': 'Basic Training',
        'intermediate': 'Intermediate Training',
        'advanced': 'Advanced Training',
        'behavioral': 'Behavioral Training',
        'agility': 'Agility Training',
        'obedience': 'Obedience Training',
        'puppy': 'Puppy Training',
        'senior': 'Senior Training',
        'tricks': 'Tricks Training'
      };
      return categoryMap[this.category] || 'Basic Training';
    }
  },
  petType: {
    type: [String],
    enum: ['dog', 'cat', 'both'],
    default: ['both']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Trainer/Instructor details
  instructor: {
    name: {
      type: String,
      default: 'Furrmaa Team'
    },
    title: {
      type: String,
      default: 'Certified Pet Trainer'
    },
    bio: {
      type: String,
      default: 'Experienced pet trainer with years of expertise in pet care and training.'
    },
    image: String,
    specialization: String,
    experience: Number, // years of experience
  },
  // Course details
  courseDuration: {
    type: Number, // total course duration in hours
    default: 0
  },
  lessonsCount: {
    type: Number,
    default: 0
  },
  quizzesCount: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  courseDescription: {
    type: String,
    default: 'Comprehensive training course designed to help you and your pet succeed.'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: function() {
      return this.category === 'basic';
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('TrainingVideo', trainingVideoSchema);




