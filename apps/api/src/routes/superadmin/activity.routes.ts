import express from 'express';
import { getAdminActivity } from '../../controllers/superadmin/activity.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.get('/activity', authenticate, authorize(['superadmin']), getAdminActivity);

export default router;
