const express = require('express');
const validate = require('../middleware/validate');
const { formLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const { loginSchema } = require('../validations/authSchemas');

const router = express.Router();

router.post('/login', formLimiter, validate(loginSchema), authController.login);

module.exports = router;
