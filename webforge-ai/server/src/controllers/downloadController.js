import Project from '../models/Project.js';
import { createProjectZipStream, generateReadme } from '../services/zipService.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const downloadProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw ApiError.notFound('Project not found.');

  const readme = generateReadme({ name: project.name, description: project.description, framework: project.framework });
  const files = [...project.files.filter((f) => f.path !== 'README.md'), { path: 'README.md', content: readme }];

  const safeName = project.name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'webforge-project';
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);

  const stream = createProjectZipStream(files);
  stream.on('error', () => {
    if (!res.headersSent) res.status(500);
    res.end();
  });
  stream.pipe(res);
});
