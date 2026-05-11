'use strict';

const Joi = require('joi');
const { NOTE_TYPES, NOTE_TARGET_TYPES } = require('../utils/enums');

const create = Joi.object({
  targetType: Joi.string()
    .valid(...NOTE_TARGET_TYPES)
    .required(),
  target: Joi.string().hex().length(24).required(),
  content: Joi.string().trim().min(1).max(1000).required(),
  type: Joi.string()
    .valid(...NOTE_TYPES)
    .optional(),
  isPublic: Joi.boolean().optional(),
});

const update = Joi.object({
  content: Joi.string().trim().min(1).max(1000).optional(),
  type: Joi.string()
    .valid(...NOTE_TYPES)
    .optional(),
  isPublic: Joi.boolean().optional(),
});

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  targetType: Joi.string()
    .valid(...NOTE_TARGET_TYPES)
    .optional(),
  target: Joi.string().hex().length(24).optional(),
  type: Joi.string()
    .valid(...NOTE_TYPES)
    .optional(),
  isPublic: Joi.boolean().optional(),
});

module.exports = { create, update, idParam, listQuery };
