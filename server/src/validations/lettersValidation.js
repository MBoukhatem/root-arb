'use strict';

const Joi = require('joi');

// ء (U+0621) → ي (U+064A) : couvre les 28 lettres arabes + variantes hamza
const ARABIC_LETTER_RE = /^[ء-ي]$/u;

const cooccurrencesParams = Joi.object({
  letter: Joi.string()
    .custom((v, helpers) => {
      const normalized = v.normalize('NFC');
      if (!ARABIC_LETTER_RE.test(normalized)) {
        return helpers.error('any.invalid');
      }
      return normalized;
    }, 'NFC + arabic check')
    .required(),
});

const cooccurrencesQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(27).default(27),
  minCount: Joi.number().integer().min(1).max(50).default(1),
  includeRoots: Joi.boolean().default(false),
});

module.exports = { cooccurrencesParams, cooccurrencesQuery };
