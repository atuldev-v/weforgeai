import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  { path: { type: String, required: true }, content: { type: String, required: true, default: '' } },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    framework: { type: String, enum: ['static', 'react', 'fullstack'], default: 'react' },
    status: { type: String, enum: ['draft', 'generating', 'ready', 'error'], default: 'draft' },

    files: { type: [fileSchema], default: [] },
    dependencies: { type: mongoose.Schema.Types.Mixed, default: {} },

    lastPrompt: { type: String, default: '' },

    githubRepo: {
      owner: { type: String, default: null },
      name: { type: String, default: null },
      url: { type: String, default: null },
      private: { type: Boolean, default: true },
      lastPushedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, updatedAt: -1 });
projectSchema.index({ owner: 1, name: 1 });

export default mongoose.model('Project', projectSchema);
