'use strict';

const Joi = require('joi');
const { SEMANTIC_FIELDS } = require('../utils/enums');

const localized = Joi.object({
  fr: Joi.string().trim().max(200).required(),
  en: Joi.string().trim().max(200).required(),
  ar: Joi.string().trim().max(200).optional().allow(''),
});

const create = Joi.object({
  letters: Joi.string().trim().required(),
  transliteration: Joi.string().trim().required(),
  transliterationSimplified: Joi.string().trim().optional(),
  coreMeaning: localized.required(),
  semanticField: Joi.string()
    .valid(...SEMANTIC_FIELDS)
    .required(),
  frequency: Joi.number().integer().min(0).optional(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
  isEssential: Joi.boolean().optional(),
  isQuranic: Joi.boolean().optional(),
});

const update = create.fork(['letters', 'transliteration', 'coreMeaning', 'semanticField'], (s) =>
  s.optional(),
);

const list = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().max(200).optional(),
  semanticField: Joi.string()
    .valid(...SEMANTIC_FIELDS)
    .optional(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
  isEssential: Joi.boolean().optional(),
  isQuranic: Joi.boolean().optional(),
  sort: Joi.string()
    .valid(
      'frequency',
      '-frequency',
      'difficulty',
      '-difficulty',
      'createdAt',
      '-createdAt',
      'letters',
      '-letters',
    )
    .optional(),
});

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = { create, update, list, idParam };
