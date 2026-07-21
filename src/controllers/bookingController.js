const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const bookingService = require('../services/bookingService');

const quote = asyncHandler(async (req, res) => {
  const result = await bookingService.calculateQuote(req.body);
  sendSuccess(res, { data: result });
});

const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Booking created successfully',
    data: booking,
  });
});

const readGuestBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingForGuest(
    req.params.bookingId,
    req.query.phone
  );
  sendSuccess(res, { data: booking });
});

const cancelGuestBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.bookingId, req.body.phone);
  sendSuccess(res, { message: 'Booking cancelled successfully', data: booking });
});

const listAdminBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.query);
  sendSuccess(res, { data: result.bookings, meta: result.pagination });
});

const readAdminBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  sendSuccess(res, { data: booking });
});

const updateAdminBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBooking(req.params.bookingId, req.body);
  sendSuccess(res, { message: 'Booking updated successfully', data: booking });
});

module.exports = {
  quote,
  create,
  readGuestBooking,
  cancelGuestBooking,
  listAdminBookings,
  readAdminBooking,
  updateAdminBooking,
};
