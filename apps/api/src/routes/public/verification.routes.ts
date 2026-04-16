import { Router } from 'express';
import * as verificationController from '../../controllers/public/verification.controller';

const router = Router();

router.get('/:id', verificationController.verifyCertificate);

export default router;
