import User from '../models/User.js';
import Project from '../models/Project.js';
import GitHubConnection from '../models/GitHubConnection.js';
import {
  buildGitHubAuthorizeUrl,
  exchangeCodeForToken,
  fetchGitHubProfile,
  createAndPushRepo,
  pushChangesToRepo,
} from '../services/githubService.js';
import { generateReadme } from '../services/zipService.js';
import { encryptSecret, decryptSecret, generateRandomToken } from '../utils/crypto.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken, signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

export const getStatus = asyncHandler(async (req, res) => {
  const connection = await GitHubConnection.findOne({ user: req.user._id });
  res.json({
    success: true,
    data: {
      connected: Boolean(connection),
      githubUsername: connection?.githubUsername || null,
    },
  });
});

/**
 * Starts the OAuth flow. We encode the requesting user's id + a nonce into a
 * signed state param (reusing the JWT signer) so the callback can be verified
 * without a server-side session store.
 */
export const connect = asyncHandler(async (req, res) => {
  const state = signToken({ sub: req.user._id.toString(), purpose: 'github_oauth', nonce: generateRandomToken(8) });
  const url = buildGitHubAuthorizeUrl(state);
  res.json({ success: true, data: { url } });
});

export const callback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) throw ApiError.badRequest('Missing OAuth code or state.');

  let payload;
  try {
    payload = verifyToken(state);
  } catch {
    throw ApiError.badRequest('Invalid or expired OAuth state.');
  }
  if (payload.purpose !== 'github_oauth') throw ApiError.badRequest('Invalid OAuth state.');

  const accessToken = await exchangeCodeForToken(code);
  const profile = await fetchGitHubProfile(accessToken);

  await GitHubConnection.findOneAndUpdate(
    { user: payload.sub },
    {
      user: payload.sub,
      githubId: profile.id,
      githubUsername: profile.username,
      accessTokenEncrypted: encryptSecret(accessToken),
      connectedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(payload.sub, { githubId: profile.id, githubUsername: profile.username });

  res.redirect(`${env.CLIENT_URL}/settings?github=connected`);
});

export const disconnect = asyncHandler(async (req, res) => {
  await GitHubConnection.deleteOne({ user: req.user._id });
  await User.findByIdAndUpdate(req.user._id, { githubId: null, githubUsername: null });
  res.json({ success: true, message: 'GitHub disconnected.' });
});

async function getDecryptedToken(userId) {
  const connection = await GitHubConnection.findOne({ user: userId }).select('+accessTokenEncrypted');
  if (!connection) throw ApiError.badRequest('Connect your GitHub account first.');
  return { connection, accessToken: decryptSecret(connection.accessTokenEncrypted) };
}

export const publish = asyncHandler(async (req, res) => {
  const { projectId, repoName, isPrivate = true } = req.body;
  if (!repoName || !/^[a-zA-Z0-9._-]+$/.test(repoName)) {
    throw ApiError.badRequest('Repository name may only contain letters, numbers, dots, dashes and underscores.');
  }

  const project = await Project.findOne({ _id: projectId, owner: req.user._id });
  if (!project) throw ApiError.notFound('Project not found.');

  const { accessToken } = await getDecryptedToken(req.user._id);

  const readme = generateReadme({ name: project.name, description: project.description, framework: project.framework });
  const filesWithReadme = [...project.files.filter((f) => f.path !== 'README.md'), { path: 'README.md', content: readme }];

  const repo = await createAndPushRepo({
    accessToken,
    repoName,
    isPrivate,
    files: filesWithReadme,
    description: project.description,
  });

  project.githubRepo = { owner: repo.owner, name: repo.name, url: repo.url, private: isPrivate, lastPushedAt: new Date() };
  await project.save();

  res.status(201).json({ success: true, data: { repo, project } });
});

export const pushChanges = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const project = await Project.findOne({ _id: projectId, owner: req.user._id });
  if (!project) throw ApiError.notFound('Project not found.');
  if (!project.githubRepo?.name) throw ApiError.badRequest('This project has not been published to GitHub yet.');

  const { accessToken } = await getDecryptedToken(req.user._id);

  const repo = await pushChangesToRepo({
    accessToken,
    owner: project.githubRepo.owner,
    repoName: project.githubRepo.name,
    files: project.files,
    message: 'Update from WebForge AI',
  });

  project.githubRepo.lastPushedAt = new Date();
  await project.save();

  res.json({ success: true, data: { repo, project } });
});
