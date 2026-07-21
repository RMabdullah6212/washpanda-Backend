const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../services/authService');

const adminAuth = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Admin authentication is required', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret(), { issuer: 'washpanda-api' });
  } catch (error) {
    throw new AppError(
      error.name === 'TokenExpiredError' ? 'Admin session has expired' : 'Invalid admin token',
      401
    );
  }

  if (payload.role !== 'admin') throw new AppError('Admin access is required', 403);

  const admin = await Admin.findOne({ _id: payload.sub, isActive: true }).lean();
  if (!admin) throw new AppError('Admin account is inactive or no longer exists', 401);

  req.admin = admin;
  return next();
});

module.exports = adminAuth;
