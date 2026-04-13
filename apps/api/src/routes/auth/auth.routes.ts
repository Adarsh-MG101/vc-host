import { Router } from 'express';
import * as authController from '../../controllers/auth/auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;