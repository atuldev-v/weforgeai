import Project from '../models/Project.js';
import ProjectVersion from '../models/ProjectVersion.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function findOwnedProject(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) throw ApiError.notFound('Project not found.');
  return project;
}

export const listProjects = asyncHandler(async (req, res) => {
  const { search = '', sort = '-updatedAt', page = 1, limit = 20 } = req.query;

  const query = { owner: req.user._id };
  if (search) query.name = { $regex: search, $options: 'i' };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-files'), // list view doesn't need full file contents
    Project.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: { projects, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description = '', framework = 'react' } = req.body;
  const project = await Project.create({ owner: req.user._id, name, description, framework, files: [] });
  res.status(201).json({ success: true, data: { project } });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  res.json({ success: true, data: { project } });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  const { name, description, files } = req.body;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (files !== undefined) {
    // Manual code-editor saves also snapshot a version, per spec section 17.
    await ProjectVersion.create({ project: project._id, reason: 'manual-edit', files: project.files });
    project.files = files;
  }

  await project.save();
  res.json({ success: true, data: { project } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  await Promise.all([project.deleteOne(), ProjectVersion.deleteMany({ project: project._id })]);
  res.json({ success: true, message: 'Project deleted.' });
});

export const duplicateProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);
  const copy = await Project.create({
    owner: req.user._id,
    name: `${project.name} (copy)`,
    description: project.description,
    framework: project.framework,
    files: project.files,
    dependencies: project.dependencies,
    status: project.status,
  });
  res.status(201).json({ success: true, data: { project: copy } });
});
