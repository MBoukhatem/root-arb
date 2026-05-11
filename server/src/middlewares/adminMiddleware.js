'use strict';

const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * requireAdmin :
 *   - À utiliser APRÈS requireAuth.
 *   - Re-lit user.role depuis la DB (jamais depuis le JWT payload).
 *     Cf. agent_06 R3 §3 (anti-élévation de privilèges via token périmé).
 */
const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, 'Authentication required', undefined, 'UNAUTHORIZED');
  }
  const user = await User.findById(req.user.id).select('role');
  if (!user) {
    throw new ApiError(401, 'User not found', undefined, 'INVALID_TOKEN');
  }
  if (user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required', undefined, 'FORBIDDEN');
  }
  return next();
});

module.exports = { requireAdmin };
