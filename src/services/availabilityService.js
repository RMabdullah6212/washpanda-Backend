const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const AppError = require('../utils/AppError');

const activeStatuses = ['pending', 'confirmed', 'assigned', 'in_progress'];

function assertBookableDate(serviceDate) {
  const requested = new Date(`${serviceDate}T00:00:00.000Z`);
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  if (Number.isNaN(requested.getTime())) {
    throw new AppError('Invalid service date', 400);
  }

  if (requested < todayUtc) {
    throw new AppError('Service date cannot be in the past', 400);
  }
}

async function getBookedCarsBySlot(serviceDate) {
  const usage = await Booking.aggregate([
    { $match: { serviceDate, status: { $in: activeStatuses } } },
    {
      $group: {
        _id: '$timeSlot.code',
        bookedCars: { $sum: '$numberOfCars' },
      },
    },
  ]);

  return new Map(usage.map((item) => [item._id, item.bookedCars]));
}

async function getAvailability(serviceDate) {
  assertBookableDate(serviceDate);

  const [timeSlots, bookedCarsBySlot] = await Promise.all([
    TimeSlot.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    getBookedCarsBySlot(serviceDate),
  ]);

  return timeSlots.map((slot) => {
    const bookedCars = bookedCarsBySlot.get(slot.code) || 0;
    const remainingCapacity = Math.max(slot.capacity - bookedCars, 0);

    return {
      id: slot._id,
      code: slot.code,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookedCars,
      remainingCapacity,
      available: remainingCapacity > 0,
    };
  });
}

async function assertSlotCapacity(serviceDate, timeSlot, requestedCars) {
  assertBookableDate(serviceDate);

  const result = await Booking.aggregate([
    {
      $match: {
        serviceDate,
        'timeSlot.code': timeSlot.code,
        status: { $in: activeStatuses },
      },
    },
    { $group: { _id: null, bookedCars: { $sum: '$numberOfCars' } } },
  ]);

  const bookedCars = result[0]?.bookedCars || 0;
  const remainingCapacity = Math.max(timeSlot.capacity - bookedCars, 0);

  if (requestedCars > remainingCapacity) {
    throw new AppError('The selected time slot does not have enough capacity', 409, {
      requestedCars,
      remainingCapacity,
    });
  }
}

module.exports = { getAvailability, assertSlotCapacity, assertBookableDate };
