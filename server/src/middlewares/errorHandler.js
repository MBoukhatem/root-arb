'use strict';

const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Error handler centralisé.
 * Normalise CastError / 11000 / ValidationError Mongoose → ApiError.
 * Réponse figée : { success:false, message, errors?, code? }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let apiError = err;

  if (!(err instanceof ApiError)) {
    // Mongoose CastError → 400
    if (err && err.name === 'CastError') {
      apiError = new ApiError(400, `Invalid ${err.path}: ${err.value}`, undefined, 'CAST_ERROR');
    }
    // Mongo duplicate key → 409
    else if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      apiError = new ApiError(409, `${field} already exists`, err.keyValue, 'DUPLICATE_KEY');
    }
    // Mongoose ValidationError → 422
    else if (err && err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      apiError = new ApiError(422, 'Validation failed', details, 'MONGOOSE_VALIDATION');
    }
    // JWT (au cas où une lib lèverait directement)
    else if (err && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
      apiError = new ApiError(401, 'Invalid token', undefined, 'INVALID_TOKEN');
    }
    // Body parser JSON malformé
    else if (err && err.type === 'entity.parse.failed') {
      apiError = new ApiError(400, 'Malformed JSON body', undefined, 'BAD_JSON');
    } else {
      apiError = new ApiError(
        err.statusCode || 500,
        err.message || 'Internal Server Error',
        undefined,
        'INTERNAL'
      );
    }
  }

  const status = apiError.statusCode || 500;
  const logPayload = {
    err: { name: err.name, message: err.message, stack: err.stack },
    method: req.method,
    url: req.originalUrl,
    status,
  };

  if (status >= 500) {
    logger.error(logPayload, '[errorHandler] 5xx');
  } else {
    logger.warn(logPayload, '[errorHandler] 4xx');
  }

  const body = { success: false, message: apiError.message };
  if (apiError.code) body.code = apiError.code;
  if (apiError.details !== undefined) body.errors = apiError.details;
  if (env.isDev && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
}

module.exports = errorHandler;
