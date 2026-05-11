'use strict';

const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * requireAuth :
 *   1. Extrait Bearer token.
 *   2. Vérifie signature + expiration.
 *   3. Charge le User (avec tokenVersion select:false).
 *   4. Vérifie user.tokenVersion === payload.tv (révocation).
 *   5. Attache req.user = { id, role, tokenVersion }.
 */
const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Missing Bearer token', undefined, 'NO_TOKEN');
  }
  const token = header.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'Empty Bearer token', undefined, 'NO_TOKEN');
  }

  const payload = verifyAccessToken(token); // lève ApiError 401 si KO

  const user = await User.findById(payload.sub).select('+tokenVersion role');
  if (!user) {
    throw new ApiError(401, 'User not found', undefined, 'INVALID_TOKEN');
  }
  if (user.tokenVersion !== payload.tv) {
    throw new ApiError(401, 'Token revoked', undefined, 'TOKEN_REVOKED');
  }

  req.user = {
    id: String(user._id),
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  return next();
});

module.exports = { requireAuth };
