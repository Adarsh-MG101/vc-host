import { Router } from 'express';
import * as profileController from '../../controllers/organization/profile.controller';

const router = Router();

router.put('/', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);

export default router;