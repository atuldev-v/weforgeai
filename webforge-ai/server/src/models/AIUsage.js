import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    operation: { type: String, enum: ['generate', 'modify'], required: true },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    success: { type: Boolean, required: true },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

aiUsageSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('AIUsage', aiUsageSchema);
