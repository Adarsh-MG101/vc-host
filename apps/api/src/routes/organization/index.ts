import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import roleRoutes from './role.routes';
import userRoutes from './user.routes';
import dashboardRoutes from './dashboard.routes';

import profileRoutes from './profile.routes';
import activityRoutes from './activity.routes';
import templateRoutes from './template.routes';
import documentRoutes from './document.routes';

const router = Router();

// Protect all organization routes — must be authenticated
router.use(authenticate);
router.use(authorize(['user', 'admin', 'superadmin']));

router.use('/dashboard', dashboardRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/activity', activityRoutes);
router.use('/templates', templateRoutes);
router.use('/certificates', documentRoutes);

export default router;