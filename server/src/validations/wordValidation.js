'use strict';

const Joi = require('joi');
const { GRAMMATICAL_CATEGORIES } = require('../utils/enums');

const translations = Joi.object({
  fr: Joi.string().trim().max(300).required(),
  en: Joi.string().trim().max(300).required(),
  ar: Joi.string().trim().max(300).optional().allow(''),
});

const example = Joi.object({
  sentence: Joi.string().max(500).required(),
  sentenceUnvocalized: Joi.string().max(500).optional(),
  translation: Joi.object({
    fr: Joi.string().max(500).required(),
    en: Joi.string().max(500).required(),
    ar: Joi.string().max(500).optional().allow(''),
  }).required(),
});

const create = Joi.object({
  arabicWord: Joi.string().trim().required(),
  arabicWordUnvocalized: Joi.string().trim().optional(),
  transliteration: Joi.string().trim().required(),
  transliterationSimplified: Joi.string().trim().optional(),
  translations: translations.required(),
  root: Joi.string().hex().length(24).required(),
  pattern: Joi.string().trim().required(),
  patternDescription: Joi.object({
    fr: Joi.string().max(300).optional(),
    en: Joi.string().max(300).optional(),
    ar: Joi.string().max(300).optional(),
  }).optional(),
  grammaticalCategory: Joi.string()
    .valid(...GRAMMATICAL_CATEGORIES)
    .required(),
  examples: Joi.array().items(example).optional(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
  isCommon: Joi.boolean().optional(),
});

const update = create.fork(
  ['arabicWord', 'transliteration', 'translations', 'root', 'pattern', 'grammaticalCategory'],
  (s) => s.optional(),
);

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const byRootParams = Joi.object({
  rootId: Joi.string().hex().length(24).required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  grammaticalCategory: Joi.string()
    .valid(...GRAMMATICAL_CATEGORIES)
    .optional(),
  isCommon: Joi.boolean().optional(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
});

module.exports = { create, update, idParam, byRootParams, listQuery };
