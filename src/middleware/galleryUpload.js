const multer = require('multer');
const AppError = require('../utils/AppError');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new AppError('Only JPG, PNG, WebP, MP4, WebM, and MOV files are allowed', 400)
      );
    }

    return callback(null, true);
  },
});

module.exports = upload;
