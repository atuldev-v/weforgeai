import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },

    githubId: { type: String, default: null, index: true },
    githubUsername: { type: String, default: null },
    githubAccessTokenEncrypted: { type: String, default: null, select: false },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    emailVerificationExpires: { type: Date, select: false, default: null },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Optional BYOK — stored encrypted at rest in a real deployment (see services/crypto in README notes).
    byokProvider: { type: String, enum: ['openai', 'anthropic', null], default: null },
    byokKeyEncrypted: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.githubAccessTokenEncrypted;
    delete ret.byokKeyEncrypted;
    delete ret.emailVerificationToken;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
