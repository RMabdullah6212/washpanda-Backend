const Admin = require('../models/Admin');
const configureCloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const { publicAdmin } = require('./authService');

function uploadPhoto(file) {
  const cloudinary = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'washpanda/admin-profiles',
        unique_filename: true,
        overwrite: false,
        transformation: [
          { width: 600, height: 600, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(new AppError(error.message || 'Profile photo upload failed', 502));
        return resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

async function updateProfilePhoto(adminId, file) {
  if (!file) throw new AppError('Profile photo is required', 400);

  const admin = await Admin.findById(adminId);
  if (!admin || !admin.isActive) throw new AppError('Admin account not found', 404);

  const previousPublicId = admin.profilePhotoPublicId;
  const upload = await uploadPhoto(file);

  try {
    admin.profilePhotoUrl = upload.secure_url;
    admin.profilePhotoPublicId = upload.public_id;
    await admin.save();
  } catch (error) {
    await configureCloudinary().uploader.destroy(upload.public_id, { resource_type: 'image' });
    throw error;
  }

  if (previousPublicId) {
    configureCloudinary().uploader.destroy(previousPublicId, {
      resource_type: 'image',
      invalidate: true,
    }).catch((error) => console.error('Unable to remove old admin profile photo:', error.message));
  }

  return publicAdmin(admin);
}

module.exports = { updateProfilePhoto };
