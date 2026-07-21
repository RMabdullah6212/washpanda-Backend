const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const authService = require('../services/authService');
const profilePhotoService = require('../services/profilePhotoService');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  sendSuccess(res, { message: 'Signed in successfully', data: result });
});

const createAdmin = asyncHandler(async (req, res) => {
  const admin = await authService.createAdmin(req.body, req.admin._id);
  sendSuccess(res, {
    statusCode: 201,
    message: 'Admin created successfully',
    data: admin,
  });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: authService.publicAdmin(req.admin) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const admin = await authService.updateProfile(req.admin._id, req.body);
  sendSuccess(res, { message: 'Profile updated successfully', data: admin });
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
  const admin = await profilePhotoService.updateProfilePhoto(req.admin._id, req.file);
  sendSuccess(res, { message: 'Profile photo updated successfully', data: admin });
});

module.exports = { login, createAdmin, me, updateProfile, updateProfilePhoto };
