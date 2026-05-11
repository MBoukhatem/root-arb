'use strict';

const Joi = require('joi');

const recordReview = Joi.object({
  root: Joi.string().hex().length(24).required(),
  success: Joi.boolean().required(),
  wordsLearned: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const update = Joi.object({
  masteryLevel: Joi.number().integer().min(0).max(5).optional(),
  notes: Joi.string().max(500).optional().allow(''),
  wordsLearned: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  masteryLevel: Joi.number().integer().min(0).max(5).optional(),
});

module.exports = { recordReview, update, idParam, listQuery };
