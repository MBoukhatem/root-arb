'use strict';

const rateLimit = require('express-rate-limit');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function tooManyRequests(req, res /* , next, options */) {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
  });
}

// Global : 100/min/IP
const globalLimiter = rateLimit({
  windowMs: MINUTE,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});

// Auth login : 5/15min/IP
const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});

// Register : 3/h/IP
const registerLimiter = rateLimit({
  windowMs: HOUR,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});

// Forgot password : 3/h/IP
const forgotLimiter = rateLimit({
  windowMs: HOUR,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  forgotLimiter,
};
