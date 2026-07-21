const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const generateBookingId = require('../utils/bookingId');
const { resolveSelections, resolveTimeSlot } = require('./catalogService');
const { assertSlotCapacity } = require('./availabilityService');

async function calculateQuote(payload) {
  return resolveSelections(payload.vehicles);
}

async function createBooking(payload) {
  const [quote, timeSlot] = await Promise.all([
    calculateQuote(payload),
    resolveTimeSlot(payload.timeSlotId),
  ]);

  await assertSlotCapacity(payload.serviceDate, timeSlot, quote.numberOfCars);

  const booking = await Booking.create({
    bookingId: generateBookingId(),
    customer: payload.customer,
    serviceDate: payload.serviceDate,
    timeSlot: {
      timeSlotId: timeSlot._id,
      code: timeSlot.code,
      title: timeSlot.title,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    },
    vehicles: quote.vehicles,
    numberOfCars: quote.numberOfCars,
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    totalAmount: quote.totalAmount,
    currency: quote.currency,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'cash' ? 'unpaid' : 'pending',
    note: payload.note,
  });

  return booking;
}

async function getBookingForGuest(bookingId, phone) {
  const booking = await Booking.findOne({
    bookingId: bookingId.toUpperCase(),
    'customer.phone': phone,
  }).lean();

  if (!booking) {
    throw new AppError('Booking not found for the supplied booking ID and phone number', 404);
  }

  return booking;
}

async function cancelBooking(bookingId, phone) {
  const booking = await Booking.findOne({
    bookingId: bookingId.toUpperCase(),
    'customer.phone': phone,
  });

  if (!booking) {
    throw new AppError('Booking not found for the supplied booking ID and phone number', 404);
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new AppError(`A ${booking.status} booking cannot be cancelled`, 409);
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();
  return booking;
}

async function listBookings({ page = 1, limit = 20, status, serviceDate }) {
  const filter = {};
  if (status) filter.status = status;
  if (serviceDate) filter.serviceDate = serviceDate;

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

async function getBookingById(bookingId) {
  const booking = await Booking.findOne({ bookingId: bookingId.toUpperCase() }).lean();
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
}

async function updateBooking(bookingId, updates) {
  const update = { ...updates };
  if (updates.status === 'cancelled') update.cancelledAt = new Date();

  const booking = await Booking.findOneAndUpdate(
    { bookingId: bookingId.toUpperCase() },
    update,
    { returnDocument: 'after', runValidators: true }
  );

  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
}

module.exports = {
  calculateQuote,
  createBooking,
  getBookingForGuest,
  cancelBooking,
  listBookings,
  getBookingById,
  updateBooking,
};
