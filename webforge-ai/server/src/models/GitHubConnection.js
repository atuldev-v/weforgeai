import mongoose from 'mongoose';

const githubConnectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    githubId: { type: String, required: true },
    githubUsername: { type: String, required: true },
    accessTokenEncrypted: { type: String, required: true, select: false },
    scopes: { type: [String], default: [] },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('GitHubConnection', githubConnectionSchema);
