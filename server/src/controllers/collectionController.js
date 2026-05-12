'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const collectionService = require('../services/collectionService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await collectionService.list(req.user.id, req.query);
  return sendSuccess(res, data, { pagination });
});

const getById = asyncHandler(async (req, res) => {
  const col = await collectionService.getById(req.params.id, req.user.id);
  return sendSuccess(res, col);
});

const create = asyncHandler(async (req, res) => {
  const col = await collectionService.create(req.user.id, req.body);
  return sendCreated(res, col, { message: 'Collection created' });
});

const update = asyncHandler(async (req, res) => {
  const col = await collectionService.update(req.user.id, req.params.id, req.body);
  return sendSuccess(res, col, { message: 'Collection updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await collectionService.remove(req.user.id, req.params.id);
  return sendSuccess(res, result, { message: 'Collection deleted' });
});

const reorderRoots = asyncHandler(async (req, res) => {
  const col = await collectionService.reorderRoots(req.user.id, req.params.id, req.body.rootIds);
  return sendSuccess(res, col, { message: 'Roots reordered' });
});

module.exports = { list, getById, create, update, remove, reorderRoots };
