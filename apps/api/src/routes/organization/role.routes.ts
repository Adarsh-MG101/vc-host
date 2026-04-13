import { Router } from 'express';
import * as roleController from '../../controllers/organization/role.controller';

const router = Router();

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);
router.put('/:roleId', roleController.updateRole);
router.delete('/:roleId', roleController.deleteRole);

export default router;
