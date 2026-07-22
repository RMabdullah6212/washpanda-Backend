const GalleryItem = require('../models/GalleryItem');
const configureCloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

function uploadBuffer(file) {
  const cloudinary = configureCloudinary();
  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'washpanda/gallery',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(new AppError(error.message || 'Cloudinary upload failed', 502));
        return resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

function videoThumbnail(publicId) {
  const cloudinary = configureCloudinary();
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [{ width: 900, height: 650, crop: 'fill', gravity: 'auto', quality: 'auto' }],
  });
}

async function listPublic() {
  return GalleryItem.find({ isActive: true, mediaType: 'image' })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
}

async function listAdmin() {
  return GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
}

async function create(file, payload) {
  if (!file) throw new AppError('Gallery image or video file is required', 400);

  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  if (payload.mediaType && payload.mediaType !== mediaType) {
    throw new AppError(`Selected media type does not match the uploaded ${mediaType} file`, 400);
  }

  const upload = await uploadBuffer(file);

  try {
    return await GalleryItem.create({
      title: payload.title,
      altText: payload.altText || payload.title,
      mediaType,
      mediaUrl: upload.secure_url,
      thumbnailUrl: mediaType === 'video' ? videoThumbnail(upload.public_id) : upload.secure_url,
      publicId: upload.public_id,
      resourceType: upload.resource_type,
      format: upload.format,
      width: upload.width || 0,
      height: upload.height || 0,
      duration: upload.duration || 0,
      bytes: upload.bytes || file.size || 0,
      sortOrder: payload.sortOrder,
      isActive: payload.isActive,
    });
  } catch (error) {
    await configureCloudinary().uploader.destroy(upload.public_id, {
      resource_type: upload.resource_type,
      invalidate: true,
    });
    throw error;
  }
}

async function update(id, payload) {
  const item = await GalleryItem.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!item) throw new AppError('Gallery item not found', 404);
  return item;
}

async function remove(id) {
  const item = await GalleryItem.findById(id);
  if (!item) throw new AppError('Gallery item not found', 404);

  const result = await configureCloudinary().uploader.destroy(item.publicId, {
    resource_type: item.resourceType,
    invalidate: true,
  });

  if (!['ok', 'not found'].includes(result.result)) {
    throw new AppError('Unable to delete the Cloudinary asset', 502);
  }

  await item.deleteOne();
  return item;
}

module.exports = { listPublic, listAdmin, create, update, remove };
