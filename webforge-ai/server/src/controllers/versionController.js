import Project from '../models/Project.js';
import ProjectVersion from '../models/ProjectVersion.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function findOwnedProject(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) throw ApiError.notFound('Project not found.');
  return project;
}

export const listVersions = asyncHandler(async (req, res) => {
  await findOwnedProject(req.params.projectId, req.user._id);
  const versions = await ProjectVersion.find({ project: req.params.projectId })
    .sort('-createdAt')
    .select('-files'); // list view omits full content for speed
  res.json({ success: true, data: { versions } });
});

export const getVersion = asyncHandler(async (req, res) => {
  await findOwnedProject(req.params.projectId, req.user._id);
  const version = await ProjectVersion.findOne({ _id: req.params.versionId, project: req.params.projectId });
  if (!version) throw ApiError.notFound('Version not found.');
  res.json({ success: true, data: { version } });
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.projectId, req.user._id);
  const version = await ProjectVersion.findOne({ _id: req.params.versionId, project: project._id });
  if (!version) throw ApiError.notFound('Version not found.');

  // Snapshot current state before restoring, so restoring is itself reversible.
  await ProjectVersion.create({ project: project._id, reason: 'restore', files: project.files, label: 'Before restore' });

  project.files = version.files;
  await project.save();

  res.json({ success: true, data: { project } });
});

export const compareVersions = asyncHandler(async (req, res) => {
  await findOwnedProject(req.params.projectId, req.user._id);
  const { fromId, toId } = req.query;
  const [from, to] = await Promise.all([
    ProjectVersion.findOne({ _id: fromId, project: req.params.projectId }),
    ProjectVersion.findOne({ _id: toId, project: req.params.projectId }),
  ]);
  if (!from || !to) throw ApiError.notFound('One or both versions not found.');

  const fromMap = new Map(from.files.map((f) => [f.path, f.content]));
  const toMap = new Map(to.files.map((f) => [f.path, f.content]));
  const allPaths = new Set([...fromMap.keys(), ...toMap.keys()]);

  const diff = [];
  for (const path of allPaths) {
    const before = fromMap.get(path);
    const after = toMap.get(path);
    if (before === after) continue;
    diff.push({
      path,
      status: before === undefined ? 'added' : after === undefined ? 'removed' : 'modified',
    });
  }

  res.json({ success: true, data: { diff } });
});
