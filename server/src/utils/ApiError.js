'use strict';

/**
 * Classe d'erreur applicative standardisée.
 * Permet à l'errorHandler de produire une réponse HTTP cohérente
 * { success:false, message, errors? } avec le bon statusCode.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode  - code HTTP (4xx/5xx)
   * @param {string} message     - message lisible
   * @param {Array|Object} [details] - détails (ex: erreurs Joi)
   * @param {string} [code]      - code d'erreur applicatif (ex: 'VALIDATION', 'INVALID_TOKEN')
   */
  constructor(statusCode, message, details = undefined, code = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details, code = 'BAD_REQUEST') {
    return new ApiError(400, message, details, code);
  }

  static unauthorized(message = 'Unauthorized', details, code = 'UNAUTHORIZED') {
    return new ApiError(401, message, details, code);
  }

  static forbidden(message = 'Forbidden', details, code = 'FORBIDDEN') {
    return new ApiError(403, message, details, code);
  }

  static notFound(message = 'Not Found', details, code = 'NOT_FOUND') {
    return new ApiError(404, message, details, code);
  }

  static conflict(message = 'Conflict', details, code = 'CONFLICT') {
    return new ApiError(409, message, details, code);
  }

  static unprocessable(message = 'Unprocessable Entity', details, code = 'UNPROCESSABLE') {
    return new ApiError(422, message, details, code);
  }

  static internal(message = 'Internal Server Error', details, code = 'INTERNAL') {
    return new ApiError(500, message, details, code);
  }
}

module.exports = ApiError;
