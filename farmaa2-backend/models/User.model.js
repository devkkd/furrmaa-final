import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  firebaseUid: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values
  },
  auth0Id: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Auth0 sub – allows multiple nulls
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  role: {
    type: String,
    enum: ['user', 'service_provider', 'veterinarian', 'admin'],
    default: 'user'
  },
  // Veterinarian-specific fields
  specialization: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  clinicName: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  // Service provider-specific fields
  services: [{
    type: String
  }],
  // Vet service type (e.g. Veterinarians, Hospitals) – used in Manage Veterinarians & Vet Services filter
  serviceType: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  }],
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;
  
  // Hash password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);


