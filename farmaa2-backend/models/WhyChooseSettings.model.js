import mongoose from 'mongoose';

const whyChooseSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'homepage',
      unique: true,
    },
    tagline: {
      type: String,
      default:
        'Furrmaa Is Built To Simplify Pet Parenting Without Compromising Care, Safety, Or Love.',
    },
  },
  { timestamps: true }
);

export default mongoose.model('WhyChooseSettings', whyChooseSettingsSchema);
