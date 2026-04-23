"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentUploadOptions = exports.imageUploadOptions = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
exports.imageUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new common_1.BadRequestException('يُسمح فقط بصور JPG, PNG, WEBP'), false);
        }
        cb(null, true);
    },
};
exports.documentUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
            return cb(new common_1.BadRequestException('يُسمح فقط بملفات JPG, PNG, PDF'), false);
        }
        cb(null, true);
    },
};
//# sourceMappingURL=multer.config.js.map