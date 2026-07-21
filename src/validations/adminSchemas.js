const { z } = require('zod');

const code = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only');

const vehicleTypeSchema = z.object({
  code,
  name: z.string().trim().min(2).max(100),
  imageUrl: z.union([z.url(), z.literal('')]).optional().default(''),
  priceModifier: z.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const servicePackageSchema = z.object({
  code,
  vehicleTypeId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid vehicle type ID'),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().default(''),
  basePrice: z.number().min(0),
  currency: z.string().trim().length(3).optional().default('PKR'),
  features: z.array(z.string().trim().min(1).max(200)).max(30).optional().default([]),
  durationMinutes: z.number().int().min(1).max(1440).optional().default(60),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const addonSchema = z.object({
  code,
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().default(''),
  price: z.number().min(0),
  currency: z.string().trim().length(3).optional().default('PKR'),
  durationMinutes: z.number().int().min(0).max(1440).optional().default(0),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const timeSlotSchema = z.object({
  code,
  title: z.string().trim().min(2).max(100),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format'),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format'),
  capacity: z.number().int().min(1).max(1000),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

function partialAtLeastOne(schema) {
  return schema
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required');
}

const catalogParamsSchema = z.object({
  resource: z.enum(['vehicle-types', 'packages', 'addons', 'time-slots']),
});

const catalogItemParamsSchema = catalogParamsSchema.extend({
  id: z.string().trim().min(1).max(64),
});

const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed']),
});

const contactParamsSchema = z.object({
  id: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid contact message id'),
});

const catalogSchemas = {
  'vehicle-types': {
    create: vehicleTypeSchema,
    update: partialAtLeastOne(vehicleTypeSchema),
  },
  packages: {
    create: servicePackageSchema,
    update: partialAtLeastOne(servicePackageSchema),
  },
  addons: {
    create: addonSchema,
    update: partialAtLeastOne(addonSchema),
  },
  'time-slots': {
    create: timeSlotSchema,
    update: partialAtLeastOne(timeSlotSchema),
  },
};

module.exports = {
  catalogParamsSchema,
  catalogItemParamsSchema,
  catalogSchemas,
  updateContactStatusSchema,
  contactParamsSchema,
};
