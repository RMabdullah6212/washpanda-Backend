const express = require('express');
const validate = require('../middleware/validate');
const catalogController = require('../controllers/catalogController');
const {
  availabilityQuerySchema,
  vehiclePackagesQuerySchema,
} = require('../validations/bookingSchemas');

const router = express.Router();

router.get('/', catalogController.readCatalog);
router.get(
  '/packages',
  validate(vehiclePackagesQuerySchema, 'query'),
  catalogController.readVehiclePackages
);
router.get(
  '/availability',
  validate(availabilityQuerySchema, 'query'),
  catalogController.readAvailability
);

module.exports = router;
