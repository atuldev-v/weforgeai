import { Router } from 'express';
import { body } from 'express-validator';
import { updateProfile, setByokKey, clearByokKey } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

router.put('/profile', [body('name').optional().trim().isLength({ min: 1, max: 100 })], validateRequest, updateProfile);
router.post(
  '/byok',
  [body('provider').isIn(['openai', 'anthropic']), body('apiKey').isLength({ min: 10 })],
  validateRequest,
  setByokKey
);
router.delete('/byok', clearByokKey);

export default router;
