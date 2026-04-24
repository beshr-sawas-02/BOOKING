import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException('يُسمح فقط بصور JPG, PNG, WEBP'),
        false,
      );
    }
    cb(null, true);
  },
};

export const documentUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException('يُسمح فقط بملفات JPG, PNG, PDF'),
        false,
      );
    }
    cb(null, true);
  },
};
