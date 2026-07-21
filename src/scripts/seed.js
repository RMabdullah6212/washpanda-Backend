require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const VehicleType = require('../models/VehicleType');
const ServicePackage = require('../models/ServicePackage');
const Addon = require('../models/Addon');
const TimeSlot = require('../models/TimeSlot');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { vehicleTypes, packages, addons, timeSlots } = require('../data/seedData');

async function upsertByCode(Model, records) {
  await Promise.all(
    records.map((record) =>
      Model.findOneAndUpdate(
        { code: record.code },
        { $set: record },
        { upsert: true, returnDocument: 'after', runValidators: true }
      )
    )
  );
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required');

  await connectDatabase(mongoUri);
  await upsertByCode(VehicleType, vehicleTypes);

  const savedVehicleTypes = await VehicleType.find({
    code: { $in: vehicleTypes.map((vehicleType) => vehicleType.code) },
  }).lean();
  const vehicleTypeIds = new Map(
    savedVehicleTypes.map((vehicleType) => [vehicleType.code, vehicleType._id])
  );
  const vehiclePackages = packages.map(({ vehicleTypeCode, ...servicePackage }) => ({
    ...servicePackage,
    vehicleTypeId: vehicleTypeIds.get(vehicleTypeCode),
  }));

  await ServicePackage.updateMany(
    { code: { $in: ['basic', 'deluxe', 'ultimate'] } },
    { $set: { isActive: false } }
  );

  await Promise.all([
    upsertByCode(ServicePackage, vehiclePackages),
    upsertByCode(Addon, addons),
    upsertByCode(TimeSlot, timeSlots),
  ]);

  const initialAdminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';
  const existingAdmin = await Admin.exists({ email: initialAdminEmail });
  if (!existingAdmin) {
    await Admin.create({
      fullName: process.env.INITIAL_ADMIN_NAME || 'WashPanda Admin',
      email: initialAdminEmail,
      passwordHash: await bcrypt.hash(initialAdminPassword, 12),
    });
    console.log(`Initial admin created: ${initialAdminEmail}`);
  }

  console.log('WashPanda catalogue and admin seeded successfully');
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
