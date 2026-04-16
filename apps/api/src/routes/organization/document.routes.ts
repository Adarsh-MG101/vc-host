import { Router } from 'express';
import * as documentController from '../../controllers/organization/document.controller';

const router = Router();

router.get('/', documentController.getCertificates);
router.get('/:id/file', documentController.getCertificateFile);
router.post('/single', documentController.generateSingle);
router.post('/bulk', documentController.generateBulk);
router.get('/bulk-zip-download', documentController.downloadBulkZip);
router.post('/bulk-email', documentController.sendBulkEmail);
router.post('/:id/email', documentController.sendEmail);
router.delete('/:id', documentController.deleteCertificate);

export default router;