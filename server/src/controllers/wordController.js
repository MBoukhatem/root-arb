'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const wordService = require('../services/wordService');

const getById = asyncHandler(async (req, res) => {
  const word = await wordService.getById(req.params.id);
  return sendSuccess(res, word);
});

const listByRoot = asyncHandler(async (req, res) => {
  const { data, pagination } = await wordService.listByRoot(req.params.rootId, req.query);
  return sendSuccess(res, data, { pagination });
});

const create = asyncHandler(async (req, res) => {
  const word = await wordService.create(req.body);
  return sendCreated(res, word, { message: 'Word created' });
});

const update = asyncHandler(async (req, res) => {
  const word = await wordService.update(req.params.id, req.body);
  return sendSuccess(res, word, { message: 'Word updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await wordService.remove(req.params.id);
  return sendSuccess(res, result, { message: 'Word deleted' });
});

module.exports = { getById, listByRoot, create, update, remove };
