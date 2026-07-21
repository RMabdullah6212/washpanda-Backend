const mongoose = require('mongoose');
const VehicleType = require('../models/VehicleType');
const ServicePackage = require('../models/ServicePackage');
const Addon = require('../models/Addon');
const TimeSlot = require('../models/TimeSlot');
const AppError = require('../utils/AppError');

function identifierFilter(identifier) {
  if (mongoose.isValidObjectId(identifier)) {
    return { _id: identifier, isActive: true };
  }

  return { code: identifier.toLowerCase(), isActive: true };
}

async function getCatalog() {
  const [vehicleTypes, packages, addons, timeSlots] = await Promise.all([
    VehicleType.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    ServicePackage.find({ isActive: true }).sort({ sortOrder: 1, basePrice: 1 }).lean(),
    Addon.find({ isActive: true }).sort({ sortOrder: 1, price: 1 }).lean(),
    TimeSlot.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
  ]);

  return { vehicleTypes, packages, addons, timeSlots };
}

async function getPackagesByVehicleType(identifier) {
  const vehicleType = await VehicleType.findOne(identifierFilter(identifier)).lean();

  if (!vehicleType) {
    throw new AppError(`Vehicle type not found: ${identifier}`, 404);
  }

  const packages = await ServicePackage.find({
    vehicleTypeId: vehicleType._id,
    isActive: true,
  })
    .sort({ sortOrder: 1, basePrice: 1 })
    .lean();

  return { vehicleType, packages };
}

async function resolveSelections(vehicles) {
  const resolvedVehicles = await Promise.all(
    vehicles.map(async (selection) => {
      const [vehicleType, servicePackage, addons] = await Promise.all([
        VehicleType.findOne(identifierFilter(selection.vehicleTypeId)).lean(),
        ServicePackage.findOne(identifierFilter(selection.packageId)).lean(),
        Promise.all(
          selection.addonIds.map((addonId) => Addon.findOne(identifierFilter(addonId)).lean())
        ),
      ]);

      if (!vehicleType) {
        throw new AppError(`Vehicle type not found: ${selection.vehicleTypeId}`, 404);
      }

      if (!servicePackage) {
        throw new AppError(`Service package not found: ${selection.packageId}`, 404);
      }

      if (
        !servicePackage.vehicleTypeId ||
        !servicePackage.vehicleTypeId.equals(vehicleType._id)
      ) {
        throw new AppError(
          `${servicePackage.name} is not available for ${vehicleType.name}`,
          400
        );
      }

      const missingAddonIndex = addons.findIndex((addon) => !addon);
      if (missingAddonIndex !== -1) {
        throw new AppError(`Add-on not found: ${selection.addonIds[missingAddonIndex]}`, 404);
      }

      const addonTotal = addons.reduce((total, addon) => total + addon.price, 0);
      const lineTotal = servicePackage.basePrice + addonTotal;

      return {
        vehicleType: {
          vehicleTypeId: vehicleType._id,
          code: vehicleType.code,
          name: vehicleType.name,
          priceModifier: vehicleType.priceModifier,
        },
        servicePackage: {
          packageId: servicePackage._id,
          code: servicePackage.code,
          name: servicePackage.name,
          basePrice: servicePackage.basePrice,
        },
        addons: addons.map((addon) => ({
          addonId: addon._id,
          code: addon.code,
          name: addon.name,
          price: addon.price,
        })),
        makeAndModel: selection.makeAndModel,
        lineTotal,
      };
    })
  );

  const subtotal = resolvedVehicles.reduce((total, vehicle) => total + vehicle.lineTotal, 0);

  return {
    vehicles: resolvedVehicles,
    numberOfCars: resolvedVehicles.length,
    subtotal,
    discountAmount: 0,
    totalAmount: subtotal,
    currency: 'PKR',
  };
}

async function resolveTimeSlot(identifier) {
  const timeSlot = await TimeSlot.findOne(identifierFilter(identifier)).lean();

  if (!timeSlot) {
    throw new AppError(`Time slot not found: ${identifier}`, 404);
  }

  return timeSlot;
}

module.exports = {
  getCatalog,
  getPackagesByVehicleType,
  resolveSelections,
  resolveTimeSlot,
};
