const { z } = require('zod');

const galleryIdParamsSchema = z.object({
  id: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid gallery item ID'),
});

const updateGallerySchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    altText: z.string().trim().max(200).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

module.exports = { galleryIdParamsSchema, updateGallerySchema };
