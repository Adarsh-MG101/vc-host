import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getTemplates,
  uploadTemplate,
  updateTemplate,
  deleteTemplate,
} from '../../controllers/organization/template.controller';
import { AuthRequest } from '../../middleware/auth';

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads', 'templates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Create org-specific subdirectory
    const req = _req as AuthRequest;
    const orgDir = path.join(uploadDir, req.user?.organization?.toString() || 'unknown');
    if (!fs.existsSync(orgDir)) {
      fs.mkdirSync(orgDir, { recursive: true });
    }
    cb(null, orgDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

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
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;