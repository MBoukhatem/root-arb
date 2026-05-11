'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Factory de middleware Joi.
 *
 *   router.post('/x', validate(schema, 'body'), controller);
 *
 * Options Joi : stripUnknown, convert, abortEarly:false.
 * En cas d'erreur → ApiError(400, 'VALIDATION', details).
 *
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  if (!schema || typeof schema.validate !== 'function') {
    throw new Error('validate(schema, source) — schema Joi requis');
  }
  if (!['body', 'query', 'params'].includes(source)) {
    throw new Error(`validate: source invalide "${source}"`);
  }

  return function validateMiddleware(req, _res, next) {
    const { value, error } = schema.validate(req[source], {
      stripUnknown: true,
      convert: true,
      abortEarly: false,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ApiError(400, 'Validation failed', details, 'VALIDATION'));
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;
