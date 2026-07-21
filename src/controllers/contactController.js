const ContactMessage = require('../models/ContactMessage');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const create = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Message received successfully',
    data: { id: message._id },
  });
});

const list = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  sendSuccess(res, { data: messages });
});

const updateStatus = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true }
  );

  if (!message) throw new AppError('Contact message not found', 404);
  sendSuccess(res, { message: 'Contact message updated successfully', data: message });
});

module.exports = { create, list, updateStatus };
