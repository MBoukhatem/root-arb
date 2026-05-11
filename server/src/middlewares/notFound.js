'use strict';

const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, undefined, 'NOT_FOUND'));
}

module.exports = notFound;
