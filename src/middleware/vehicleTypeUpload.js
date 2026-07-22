const multer = require('multer');
const AppError = require('../utils/AppError');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const vehicleTypeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError('Vehicle photo must be a JPG, PNG, or WebP image', 400));
    }
    return callback(null, true);
  },
});

module.exports = vehicleTypeUpload;
