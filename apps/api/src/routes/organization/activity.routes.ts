import { Router } from 'express';
import { getOrganizationActivity } from '../../controllers/organization/activity.controller';

const router = Router();

router.get('/', getOrganizationActivity);

export default router;
