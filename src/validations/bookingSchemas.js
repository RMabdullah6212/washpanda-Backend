const { z } = require('zod');
const { mongoIdOrCode, dateString } = require('./commonSchemas');

const vehicleSchema = z.object({
  vehicleTypeId: mongoIdOrCode,
  packageId: mongoIdOrCode,
  addonIds: z.array(mongoIdOrCode).max(20).default([]),
  makeAndModel: z.string().trim().max(100).optional().default(''),
});

const quoteSchema = z.object({
  vehicles: z.array(vehicleSchema).min(1).max(10),
});

const createBookingSchema = quoteSchema.extend({
  serviceDate: dateString,
  timeSlotId: mongoIdOrCode,
  paymentMethod: z.enum(['cash', 'bank', 'card']),
  note: z.string().trim().max(1000).optional().default(''),
  customer: z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.email(),
    phone: z.string().trim().min(7).max(25),
    address: z.string().trim().min(5).max(300),
  }),
});

const availabilityQuerySchema = z.object({
  date: dateString,
});

const vehiclePackagesQuerySchema = z.object({
  vehicleType: mongoIdOrCode,
});

const bookingIdParamsSchema = z.object({
  bookingId: z.string().trim().toUpperCase().regex(/^WP-\d{8}-[A-F0-9]{8}$/),
});

const bookingLookupQuerySchema = z.object({
  phone: z.string().trim().min(7).max(25),
});

const cancelBookingSchema = z.object({
  phone: z.string().trim().min(7).max(25),
});

const updateBookingSchema = z
  .object({
    status: z
      .enum(['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'])
      .optional(),
    paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed', 'refunded']).optional(),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

module.exports = {
  quoteSchema,
  createBookingSchema,
  availabilityQuerySchema,
  vehiclePackagesQuerySchema,
  bookingIdParamsSchema,
  bookingLookupQuerySchema,
  cancelBookingSchema,
  updateBookingSchema,
};
