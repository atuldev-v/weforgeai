import Project from '../models/Project.js';
import ProjectVersion from '../models/ProjectVersion.js';
import { generateWebsite, modifyWebsite } from '../services/ai/aiService.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { decryptSecret } from '../utils/crypto.js';

/** Attaches a transient, decrypted BYOK key to the in-memory user object for this request only. */
function attachByokIfPresent(user) {
  if (user.byokProvider && user.byokKeyEncrypted) {
    user.byokKeyDecryptedForRequest = decryptSecret(user.byokKeyEncrypted);
  }
  return user;
}

export const generate = asyncHandler(async (req, res) => {
  const { prompt, projectId } = req.body;
  if (!prompt || prompt.trim().length < 5) {
    throw ApiError.badRequest('Please describe the website you want in a bit more detail.');
  }

  const user = attachByokIfPresent(req.user);

  let project = projectId ? await Project.findOne({ _id: projectId, owner: user._id }) : null;
  if (projectId && !project) throw ApiError.notFound('Project not found.');

  if (project) project.status = 'generating';
  if (project) await project.save();

  let result;
  try {
    result = await generateWebsite({ user, prompt });
  } catch (err) {
    if (project) {
      project.status = 'error';
      await project.save();
    }
    throw err;
  }

  if (!project) {
    project = await Project.create({
      owner: user._id,
      name: result.project.name || 'Untitled Project',
      description: result.project.description || '',
      framework: result.project.framework || 'react',
      files: result.files,
      dependencies: result.dependencies,
      lastPrompt: prompt,
      status: 'ready',
    });
  } else {
    project.name = result.project.name || project.name;
    project.description = result.project.description || project.description;
    project.framework = result.project.framework || project.framework;
    project.files = result.files;
    project.dependencies = result.dependencies;
    project.lastPrompt = prompt;
    project.status = 'ready';
    await project.save();
  }

  await ProjectVersion.create({
    project: project._id,
    reason: 'initial-generation',
    prompt,
    files: project.files,
    label: 'Initial generation',
  });

  res.status(201).json({
    success: true,
    data: { project, explanation: result.explanation, commands: result.commands },
  });
});

export const modify = asyncHandler(async (req, res) => {
  const { projectId, instruction } = req.body;
  if (!instruction || instruction.trim().length < 3) {
    throw ApiError.badRequest('Please describe the change you want.');
  }

  const user = attachByokIfPresent(req.user);
  const project = await Project.findOne({ _id: projectId, owner: user._id });
  if (!project) throw ApiError.notFound('Project not found.');

  // Snapshot before modifying, so the user can always roll back an AI edit.
  await ProjectVersion.create({ project: project._id, reason: 'ai-modification', prompt: instruction, files: project.files, label: 'Before AI edit' });

  const result = await modifyWebsite({ user, project, instruction });

  project.files = result.files;
  project.lastPrompt = instruction;
  project.status = 'ready';
  await project.save();

  res.json({
    success: true,
    data: { project, explanation: result.explanation, changedFiles: result.changedFiles },
  });
});
