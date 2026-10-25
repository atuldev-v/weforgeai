import { Router } from 'express';
import { listVersions, getVersion, restoreVersion, compareVersions } from '../controllers/versionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/:projectId', listVersions);
router.get('/:projectId/compare', compareVersions);
router.get('/:projectId/:versionId', getVersion);
router.post('/:projectId/:versionId/restore', restoreVersion);

export default router;
