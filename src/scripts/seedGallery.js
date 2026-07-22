require('dotenv').config();

const path = require('path');
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const configureCloudinary = require('../config/cloudinary');
const GalleryItem = require('../models/GalleryItem');

const initialPhotos = ['1.png', '3.png', '4.png', '5.png', '6.png'];

async function seedGallery() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

  await connectDatabase(process.env.MONGODB_URI);
  const cloudinary = configureCloudinary();

  for (const [index, filename] of initialPhotos.entries()) {
    const publicId = `washpanda/gallery/initial-${path.parse(filename).name}`;
    const title = `WashPanda gallery ${index + 1}`;
    const existingItem = await GalleryItem.findOne({ $or: [{ publicId }, { title }] });

    if (existingItem) {
      console.log(`Gallery photo already seeded: ${filename}`);
      continue;
    }

    const localPath = path.resolve(__dirname, '../../../frontend/src/assets/Home', filename);
    const upload = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
    });

    try {
      await GalleryItem.create({
        title,
        altText: `WashPanda car wash result ${index + 1}`,
        mediaType: 'image',
        mediaUrl: upload.secure_url,
        thumbnailUrl: upload.secure_url,
        publicId: upload.public_id,
        resourceType: upload.resource_type,
        format: upload.format,
        width: upload.width || 0,
        height: upload.height || 0,
        bytes: upload.bytes || 0,
        sortOrder: index,
        isActive: true,
      });
      console.log(`Gallery photo uploaded and saved: ${filename}`);
    } catch (error) {
      await cloudinary.uploader.destroy(upload.public_id, {
        resource_type: upload.resource_type,
        invalidate: true,
      });
      throw error;
    }
  }

  console.log('Initial gallery seeded successfully');
}

seedGallery()
  .catch((error) => {
    console.error('Gallery seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
