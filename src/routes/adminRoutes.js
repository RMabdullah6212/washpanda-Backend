const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const validateCatalog = require('../middleware/validateCatalog');
const bookingController = require('../controllers/bookingController');
const contactController = require('../controllers/contactController');
const adminCatalogController = require('../controllers/adminCatalogController');
const galleryController = require('../controllers/galleryController');
const galleryUpload = require('../middleware/galleryUpload');
const profilePhotoUpload = require('../middleware/profilePhotoUpload');
const authController = require('../controllers/authController');
const { createAdminSchema, updateProfileSchema } = require('../validations/authSchemas');
const {
  bookingIdParamsSchema,
  updateBookingSchema,
} = require('../validations/bookingSchemas');
const {
  catalogParamsSchema,
  catalogItemParamsSchema,
  updateContactStatusSchema,
  contactParamsSchema,
} = require('../validations/adminSchemas');
const {
  galleryIdParamsSchema,
  updateGallerySchema,
} = require('../validations/gallerySchemas');

const router = express.Router();

router.use(adminAuth);

router.get('/me', authController.me);
router.patch('/me', validate(updateProfileSchema), authController.updateProfile);
router.patch('/me/photo', profilePhotoUpload.single('photo'), authController.updateProfilePhoto);
router.post('/admins', validate(createAdminSchema), authController.createAdmin);

router.get('/bookings', bookingController.listAdminBookings);
router.get(
  '/bookings/:bookingId',
  validate(bookingIdParamsSchema, 'params'),
  bookingController.readAdminBooking
);
router.patch(
  '/bookings/:bookingId',
  validate(bookingIdParamsSchema, 'params'),
  validate(updateBookingSchema),
  bookingController.updateAdminBooking
);
router.get('/contact-messages', contactController.list);
router.patch(
  '/contact-messages/:id',
  validate(contactParamsSchema, 'params'),
  validate(updateContactStatusSchema),
  contactController.updateStatus
);
router.get('/gallery', galleryController.listAdmin);
router.post('/gallery', galleryUpload.single('media'), galleryController.create);
router.patch(
  '/gallery/:id',
  validate(galleryIdParamsSchema, 'params'),
  validate(updateGallerySchema),
  galleryController.update
);
router.delete(
  '/gallery/:id',
  validate(galleryIdParamsSchema, 'params'),
  galleryController.remove
);

router.get(
  '/catalog/:resource',
  validate(catalogParamsSchema, 'params'),
  adminCatalogController.list
);
router.post(
  '/catalog/:resource',
  validate(catalogParamsSchema, 'params'),
  validateCatalog('create'),
  adminCatalogController.create
);
router.patch(
  '/catalog/:resource/:id',
  validate(catalogItemParamsSchema, 'params'),
  validateCatalog('update'),
  adminCatalogController.update
);
router.delete(
  '/catalog/:resource/:id',
  validate(catalogItemParamsSchema, 'params'),
  adminCatalogController.remove
);

module.exports = router;
