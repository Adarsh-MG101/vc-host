import { Router } from 'express';
import multer from 'multer';
import * as orgController from '../../controllers/superadmin/organization.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all superadmin organization routes
router.use(authenticate);
router.use(authorize(['superadmin']));

router.get('/', orgController.getOrganizations);
router.post('/', upload.single('logo'), orgController.createOrganization);
router.put('/:id', upload.single('logo'), orgController.updateOrganization);
router.delete('/:id', orgController.deleteOrganization);

export default router;