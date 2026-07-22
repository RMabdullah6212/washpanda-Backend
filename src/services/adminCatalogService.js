const VehicleType = require('../models/VehicleType');
const ServicePackage = require('../models/ServicePackage');
const Addon = require('../models/Addon');
const TimeSlot = require('../models/TimeSlot');
const AppError = require('../utils/AppError');
const configureCloudinary = require('../config/cloudinary');

const models = {
  'vehicle-types': VehicleType,
  packages: ServicePackage,
  addons: Addon,
  'time-slots': TimeSlot,
};

function getModel(resource) {
  const Model = models[resource];
  if (!Model) throw new AppError('Unsupported catalogue resource', 404);
  return Model;
}

async function list(resource) {
  return getModel(resource).find().sort({ sortOrder: 1, createdAt: 1 }).lean();
}

async function create(resource, payload) {
  if (resource === 'packages') {
    const vehicleTypeExists = await VehicleType.exists({ _id: payload.vehicleTypeId });
    if (!vehicleTypeExists) throw new AppError('Vehicle type not found', 404);
  }

  return getModel(resource).create(payload);
}

async function update(resource, id, payload) {
  if (resource === 'packages' && payload.vehicleTypeId) {
    const vehicleTypeExists = await VehicleType.exists({ _id: payload.vehicleTypeId });
    if (!vehicleTypeExists) throw new AppError('Vehicle type not found', 404);
  }

  const item = await getModel(resource).findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!item) throw new AppError('Catalogue item not found', 404);
  return item;
}

async function remove(resource, id) {
  const item = await getModel(resource).findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: 'after', runValidators: true }
  );

  if (!item) throw new AppError('Catalogue item not found', 404);

  if (resource === 'vehicle-types') {
    await ServicePackage.updateMany(
      { vehicleTypeId: item._id, isActive: true },
      { $set: { isActive: false } }
    );

    if (item.imagePublicId) {
      configureCloudinary().uploader.destroy(item.imagePublicId, {
        resource_type: 'image',
        invalidate: true,
      }).catch((error) => console.error('Unable to remove vehicle photo:', error.message));
    }
  }

  return item;
}

module.exports = { list, create, update, remove };
