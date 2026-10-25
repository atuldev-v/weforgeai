import { Router } from 'express';
import { body } from 'express-validator';
import { getStatus, connect, callback, disconnect, publish, pushChanges } from '../controllers/githubController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

// callback is hit by GitHub directly (browser redirect), so it can't carry our auth cookie flow the same way —
// user identity comes from the signed `state` param instead (see githubController.connect/callback).
router.get('/callback', callback);

router.use(requireAuth);
router.get('/status', getStatus);
router.get('/connect', connect);
router.post('/disconnect', disconnect);
router.post(
  '/publish',
  [body('projectId').notEmpty(), body('repoName').trim().isLength({ min: 1, max: 100 })],
  validateRequest,
  publish
);
router.post('/push', [body('projectId').notEmpty()], validateRequest, pushChanges);

export default router;
