import { Router } from 'express';
import { getDashboardStats } from '../../controllers/organization/dashboard.controller';
import { authorize } from '../../middleware/auth';

const router = Router();

// Organization Dashboard Stats — Must be member or admin
router.get('/stats', authorize(['user', 'admin', 'superadmin']), getDashboardStats);

export default router;
