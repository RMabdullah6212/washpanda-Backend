const express = require('express');
const validate = require('../middleware/validate');
const { formLimiter } = require('../middleware/rateLimiter');
const bookingController = require('../controllers/bookingController');
const {
  quoteSchema,
  createBookingSchema,
  bookingIdParamsSchema,
  bookingLookupQuerySchema,
  cancelBookingSchema,
} = require('../validations/bookingSchemas');

const router = express.Router();

router.post('/quote', formLimiter, validate(quoteSchema), bookingController.quote);
router.post('/', formLimiter, validate(createBookingSchema), bookingController.create);
router.get(
  '/:bookingId',
  validate(bookingIdParamsSchema, 'params'),
  validate(bookingLookupQuerySchema, 'query'),
  bookingController.readGuestBooking
);
router.post(
  '/:bookingId/cancel',
  formLimiter,
  validate(bookingIdParamsSchema, 'params'),
  validate(cancelBookingSchema),
  bookingController.cancelGuestBooking
);

module.exports = router;
