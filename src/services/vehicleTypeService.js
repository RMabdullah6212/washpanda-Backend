const VehicleType = require('../models/VehicleType');
const configureCloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

function uploadPhoto(file, code) {
  const cloudinary = configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'washpanda/vehicle-types',
        public_id: `${code}-${Date.now()}`,
        overwrite: false,
        transformation: [
          { width: 900, height: 500, crop: 'fit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(new AppError(error.message || 'Vehicle photo upload failed', 502));
        }
        return resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

async function destroyPhoto(publicId) {
  if (!publicId) return;
  await configureCloudinary().uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

async function create(payload, file) {
  if (!file) throw new AppError('Vehicle photo is required', 400);

  const upload = await uploadPhoto(file, payload.code);
  try {
    return await VehicleType.create({
      ...payload,
      imageUrl: upload.secure_url,
      imagePublicId: upload.public_id,
    });
  } catch (error) {
    await destroyPhoto(upload.public_id);
    throw error;
  }
}

async function update(id, payload, file) {
  const vehicleType = await VehicleType.findById(id);
  if (!vehicleType) throw new AppError('Vehicle type not found', 404);

  let upload;
  if (file) upload = await uploadPhoto(file, payload.code || vehicleType.code);

  const previousPublicId = vehicleType.imagePublicId;
  try {
    Object.assign(vehicleType, payload);
    if (upload) {
      vehicleType.imageUrl = upload.secure_url;
      vehicleType.imagePublicId = upload.public_id;
    }
    await vehicleType.save();
  } catch (error) {
    if (upload) await destroyPhoto(upload.public_id);
    throw error;
  }

  if (upload && previousPublicId) {
    destroyPhoto(previousPublicId).catch((error) => {
      console.error('Unable to remove old vehicle photo:', error.message);
    });
  }

  return vehicleType;
}

module.exports = { create, update, destroyPhoto };
