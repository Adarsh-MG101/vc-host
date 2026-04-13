import { Router } from 'express';
import organizationRoutes from './organization.routes';
import activityRoutes from './activity.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/organizations', organizationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', activityRoutes);

export default router;