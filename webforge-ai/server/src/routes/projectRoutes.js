import { Router } from 'express';
import { body } from 'express-validator';
import {
  listProjects, createProject, getProject, updateProject, deleteProject, duplicateProject,
} from '../controllers/projectController.js';
import { downloadProject } from '../controllers/downloadController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

router.get('/', listProjects);
router.post('/', [body('name').trim().isLength({ min: 1, max: 120 })], validateRequest, createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/duplicate', duplicateProject);
router.get('/:id/download', downloadProject);

export default router;
