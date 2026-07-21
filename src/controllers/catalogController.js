const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { getCatalog, getPackagesByVehicleType } = require('../services/catalogService');
const { getAvailability } = require('../services/availabilityService');

const readCatalog = asyncHandler(async (req, res) => {
  const catalog = await getCatalog();
  sendSuccess(res, { data: catalog });
});

const readAvailability = asyncHandler(async (req, res) => {
  const slots = await getAvailability(req.query.date);
  sendSuccess(res, { data: { date: req.query.date, slots } });
});

const readVehiclePackages = asyncHandler(async (req, res) => {
  const result = await getPackagesByVehicleType(req.query.vehicleType);
  sendSuccess(res, { data: result });
});

module.exports = { readCatalog, readVehiclePackages, readAvailability };
