import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';
import { env } from '../../config/env';

const router = Router();

// Ensure upload root and subdirectories exist
const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
['member', 'equipment', 'menu_item'].forEach((sub) => {
  const dir = path.join(uploadRoot, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const category = (req.body.category as string) || 'member';
    const validCategory = ['member', 'equipment', 'menu_item'].includes(category)
      ? category
      : 'member';
    const targetDir = path.join(uploadRoot, validCategory);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const userId = req.user?.sub ?? req.user?.id ?? '0';
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_MIME_TYPE: Only JPEG, PNG, and WebP images are allowed'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
});

/**
 * UP-01: POST /api/v1/uploads
 * Upload a photo file (multipart/form-data)
 */
router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 'FILE_TOO_LARGE', 'File size exceeds maximum allowed limit of 5MB', 413);
        }
        return sendError(res, 'UPLOAD_ERROR', err.message || 'File upload failed', 400);
      }

      if (!req.file) {
        return sendError(res, 'MISSING_FILE', 'No file was uploaded in request field "file"', 400);
      }

      const category = (req.body.category as string) || 'member';
      const validCategory = ['member', 'equipment', 'menu_item'].includes(category)
        ? category
        : 'member';

      const fileUrl = `/uploads/${validCategory}/${req.file.filename}`;

      return sendSuccess(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
        'File uploaded successfully',
        201
      );
    });
  }
);

export default router;
