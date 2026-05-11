'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const { authLimiter, registerLimiter } = require('../middlewares/rateLimiters');
const authValidation = require('../validations/authValidation');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  registerLimiter,
  validate(authValidation.register, 'body'),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(authValidation.login, 'body'),
  authController.login
);

router.get('/me', requireAuth, authController.me);

router.post('/logout', requireAuth, authController.logout);

router.put(
  '/password',
  requireAuth,
  validate(authValidation.changePassword, 'body'),
  authController.changePassword
);

module.exports = router;
