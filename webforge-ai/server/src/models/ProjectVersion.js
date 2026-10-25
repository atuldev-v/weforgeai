import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  { path: { type: String, required: true }, content: { type: String, required: true, default: '' } },
  { _id: false }
);

const projectVersionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    label: { type: String, default: '' },
    reason: { type: String, enum: ['initial-generation', 'ai-modification', 'manual-edit', 'restore'], required: true },
    prompt: { type: String, default: '' },
    files: { type: [fileSchema], required: true },
  },
  { timestamps: true }
);

projectVersionSchema.index({ project: 1, createdAt: -1 });

export default mongoose.model('ProjectVersion', projectVersionSchema);
