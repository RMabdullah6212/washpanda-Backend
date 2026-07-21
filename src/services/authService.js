const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');

function jwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new AppError('JWT authentication is not configured', 503);
  }
  return process.env.JWT_SECRET;
}

function publicAdmin(admin) {
  return {
    id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    profilePhotoUrl: admin.profilePhotoUrl || '',
    isActive: admin.isActive,
    createdAt: admin.createdAt,
  };
}

async function login(email, password) {
  const admin = await Admin.findOne({ email, isActive: true }).select('+passwordHash');
  const validPassword = admin && (await bcrypt.compare(password, admin.passwordHash));

  if (!validPassword) throw new AppError('Invalid email or password', 401);

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = jwt.sign({ role: 'admin' }, jwtSecret(), {
    subject: admin._id.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'washpanda-api',
  });

  return { token, admin: publicAdmin(admin) };
}

async function createAdmin(payload, createdBy) {
  const existing = await Admin.exists({ email: payload.email });
  if (existing) throw new AppError('An admin with this email already exists', 409);

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const admin = await Admin.create({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash,
    createdBy,
  });

  return publicAdmin(admin);
}

async function updateProfile(adminId, payload) {
  const admin = await Admin.findById(adminId).select('+passwordHash');
  if (!admin || !admin.isActive) throw new AppError('Admin account not found', 404);

  if (payload.email || payload.newPassword) {
    const validPassword = await bcrypt.compare(payload.currentPassword, admin.passwordHash);
    if (!validPassword) throw new AppError('Current password is incorrect', 401);
  }

  if (payload.email && payload.email !== admin.email) {
    const emailInUse = await Admin.exists({ email: payload.email, _id: { $ne: admin._id } });
    if (emailInUse) throw new AppError('An admin with this email already exists', 409);
    admin.email = payload.email;
  }

  if (payload.fullName !== undefined) admin.fullName = payload.fullName;
  if (payload.newPassword) admin.passwordHash = await bcrypt.hash(payload.newPassword, 12);
  await admin.save();

  return publicAdmin(admin);
}

module.exports = { login, createAdmin, updateProfile, jwtSecret, publicAdmin };
