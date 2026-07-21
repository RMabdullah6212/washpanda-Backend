const { z } = require('zod');

const createContactSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().min(7).max(25),
  message: z.string().trim().min(5).max(2000),
});

module.exports = { createContactSchema };
