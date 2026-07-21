const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const adminCatalogService = require('../services/adminCatalogService');

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

module.exports = { list, create, update, remove };
