const { z } = require('zod');

const email = z.email().transform((value) => value.toLowerCase());
const password = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

const createAdminSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email,
  password,
});

const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    email: email.optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: password.optional(),
  })
  .refine(
    (value) => value.fullName !== undefined || value.email !== undefined || value.newPassword,
    'At least one profile field is required'
  )
  .refine(
    (value) => (!value.email && !value.newPassword) || Boolean(value.currentPassword),
    { message: 'Current password is required to change email or password', path: ['currentPassword'] }
  );

module.exports = { loginSchema, createAdminSchema, updateProfileSchema };
