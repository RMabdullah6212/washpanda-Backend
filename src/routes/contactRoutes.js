const express = require('express');
const validate = require('../middleware/validate');
const { formLimiter } = require('../middleware/rateLimiter');
const contactController = require('../controllers/contactController');
const { createContactSchema } = require('../validations/contactSchemas');

const router = express.Router();

router.post('/', formLimiter, validate(createContactSchema), contactController.create);

module.exports = router;
