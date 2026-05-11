'use strict';

const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).optional().allow(''),
  roots: Joi.array().items(Joi.string().hex().length(24)).optional(),
  isPublic: Joi.boolean().optional(),
  coverColor: Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  icon: Joi.string().max(8).optional(),
});

const update = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  roots: Joi.array().items(Joi.string().hex().length(24)).optional(),
  isPublic: Joi.boolean().optional(),
  coverColor: Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  icon: Joi.string().max(8).optional(),
});

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  isPublic: Joi.boolean().optional(),
});

module.exports = { create, update, idParam, listQuery };
