import { Router } from 'express';
import * as orgController from '../../controllers/superadmin/organization.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Protect all superadmin organization routes
router.use(authenticate);
router.use(authorize(['superadmin']));

router.get('/', orgController.getOrganizations);
router.post('/', orgController.createOrganization);
router.put('/:id', orgController.updateOrganization);
router.delete('/:id', orgController.deleteOrganization);

export default router;