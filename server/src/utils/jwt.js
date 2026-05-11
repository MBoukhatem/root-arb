'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('./ApiError');

/**
 * Signe un access token Bearer.
 * Payload minimal : sub (user id), tv (tokenVersion), role.
 */
function signAccessToken({ userId, tokenVersion, role }) {
  return jwt.sign(
    { sub: String(userId), tv: tokenVersion, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

/**
 * Vérifie un access token. Lève ApiError(401) si invalide/expiré.
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expiré', undefined, 'TOKEN_EXPIRED');
    }
    throw new ApiError(401, 'Token invalide', undefined, 'INVALID_TOKEN');
  }
}

module.exports = { signAccessToken, verifyAccessToken };
