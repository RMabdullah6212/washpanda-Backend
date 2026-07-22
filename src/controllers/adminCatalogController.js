const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const adminCatalogService = require('../services/adminCatalogService');
const vehicleTypeService = require('../services/vehicleTypeService');
const { catalogSchemas } = require('../validations/adminSchemas');
const AppError = require('../utils/AppError');

function vehiclePayload(body, operation) {
  const raw = { ...body };
  for (const field of ['priceModifier', 'sortOrder']) {
    if (raw[field] !== undefined && raw[field] !== '') raw[field] = Number(raw[field]);
  }
  if (raw.isActive !== undefined) raw.isActive = raw.isActive === true || raw.isActive === 'true';

  const result = catalogSchemas['vehicle-types'][operation].safeParse(raw);
  if (!result.success) {
    throw new AppError(
      'Request validation failed',
      400,
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }
  return result.data;
}

const list = asyncHandler(async (req, res) => {
  const items = await adminCatalogService.list(req.params.resource);
  sendSuccess(res, { data: items });
});

const create = asyncHandler(async (req, res) => {
  const item = await adminCatalogService.create(req.params.resource, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Catalogue item created successfully',
    data: item,
  });
});

const update = asyncHandler(async (req, res) => {
  const item = await adminCatalogService.update(req.params.resource, req.params.id, req.body);
  sendSuccess(res, { message: 'Catalogue item updated successfully', data: item });
});

const remove = asyncHandler(async (req, res) => {
  const item = await adminCatalogService.remove(req.params.resource, req.params.id);
  sendSuccess(res, {
    message: req.params.resource === 'vehicle-types'
      ? 'Car category and its wash packages deleted successfully'
      : 'Catalogue item disabled successfully',
    data: item,
  });
});

const createVehicleType = asyncHandler(async (req, res) => {
  const item = await vehicleTypeService.create(vehiclePayload(req.body, 'create'), req.file);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Vehicle type and photo created successfully',
    data: item,
  });
});

const updateVehicleType = asyncHandler(async (req, res) => {
  const item = await vehicleTypeService.update(
    req.params.id,
    vehiclePayload(req.body, 'update'),
    req.file
  );
  sendSuccess(res, { message: 'Vehicle type updated successfully', data: item });
});

module.exports = { list, create, update, remove, createVehicleType, updateVehicleType };
