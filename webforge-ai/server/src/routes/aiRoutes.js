import { Router } from 'express';
import { body } from 'express-validator';
import { generate, modify } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(requireAuth, aiLimiter);

router.post('/generate', [body('prompt').trim().isLength({ min: 5, max: 4000 })], validateRequest, generate);
router.post(
  '/modify',
  [body('projectId').notEmpty(), body('instruction').trim().isLength({ min: 3, max: 2000 })],
  validateRequest,
  modify
);

export default router;
