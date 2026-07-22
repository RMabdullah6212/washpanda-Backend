require('dotenv').config();

const path = require('path');
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const configureCloudinary = require('../config/cloudinary');
const VehicleType = require('../models/VehicleType');

const vehiclePhotos = [
  { code: 'hatchback', filename: 'hatchback.png' },
  { code: 'sedan', filename: 'sedan.png' },
  { code: 'crossover', filename: 'crossover.png' },
  { code: 'suv', filename: 'suv.png' },
  { code: 'minivan', filename: 'minivan.png' },
];

async function seedVehicleImages() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

  const cloudinary = configureCloudinary();
  const uploads = [];

  for (const photo of vehiclePhotos) {
    const localPath = path.resolve(__dirname, '../../../frontend/src/assets/Home', photo.filename);
    const upload = await cloudinary.uploader.upload(localPath, {
      public_id: `washpanda/vehicle-types/${photo.code}`,
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
      transformation: [
        { width: 900, height: 500, crop: 'fit' },
        { quality: 'auto' },
      ],
    });
    uploads.push({ ...photo, upload });
    console.log(`Vehicle photo uploaded: ${photo.filename}`);
  }

  await connectDatabase(process.env.MONGODB_URI);
  for (const { code, upload } of uploads) {
    const vehicleType = await VehicleType.findOneAndUpdate(
      { code },
      {
        $set: {
          imageUrl: upload.secure_url,
          imagePublicId: upload.public_id,
        },
      },
      { returnDocument: 'after', runValidators: true }
    );
    if (!vehicleType) throw new Error(`Vehicle type not found: ${code}`);
    console.log(`Vehicle URL saved in database: ${code}`);
  }

  console.log('Vehicle photos seeded successfully');
}

seedVehicleImages()
  .catch((error) => {
    console.error('Vehicle photo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
