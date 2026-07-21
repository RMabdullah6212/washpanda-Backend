const { z } = require('zod');

const mongoIdOrCode = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Must be a MongoDB id or code');

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');

module.exports = { mongoIdOrCode, dateString };
