import { Router } from 'express';
import multer from 'multer';
import {
  getTemplates,
  uploadTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplatePreview,
  getTemplateThumbnail,
} from '../../controllers/organization/template.controller';

// Use memory storage — files are held as Buffer and sent to S3 directly
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .docx files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = Router();

router.get('/', getTemplates);
router.post('/', upload.single('file'), uploadTemplate);
router.get('/:id/preview', getTemplatePreview);
router.get('/:id/thumbnail', getTemplateThumbnail);
router.put('/:id', upload.single('file'), updateTemplate);  // supports optional file re-upload
router.delete('/:id', deleteTemplate);

export default router;