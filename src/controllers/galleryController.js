const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const galleryService = require('../services/galleryService');

function parseBoolean(value, defaultValue = true) {
  if (value === undefined) return defaultValue;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new AppError('isActive must be true or false', 400);
}

function parseSortOrder(value) {
  const number = value === undefined || value === '' ? 0 : Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new AppError('sortOrder must be a non-negative integer', 400);
  }
  return number;
}

const listPublic = asyncHandler(async (req, res) => {
  const items = await galleryService.listPublic();
  sendSuccess(res, { data: items });
});

const listAdmin = asyncHandler(async (req, res) => {
  const items = await galleryService.listAdmin();
  sendSuccess(res, { data: items });
});

const create = asyncHandler(async (req, res) => {
  const title = req.body.title?.trim();
  if (!title || title.length < 2 || title.length > 120) {
    throw new AppError('Title must be between 2 and 120 characters', 400);
  }

  const altText = (req.body.altText || '').trim();
  if (altText.length > 200) throw new AppError('Alt text cannot exceed 200 characters', 400);

  const item = await galleryService.create(req.file, {
    title,
    altText,
    mediaType: req.body.mediaType,
    sortOrder: parseSortOrder(req.body.sortOrder),
    isActive: parseBoolean(req.body.isActive),
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Gallery media uploaded successfully',
    data: item,
  });
});

const update = asyncHandler(async (req, res) => {
  const item = await galleryService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Gallery item updated successfully', data: item });
});

const remove = asyncHandler(async (req, res) => {
  const item = await galleryService.remove(req.params.id);
  sendSuccess(res, { message: 'Gallery item deleted successfully', data: item });
});

module.exports = { listPublic, listAdmin, create, update, remove };
