'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const rootService = require('../services/rootService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await rootService.list(req.query);
  return sendSuccess(res, data, { pagination });
});

const essential = asyncHandler(async (_req, res) => {
  const data = await rootService.listEssential();
  return sendSuccess(res, data);
});

const getById = asyncHandler(async (req, res) => {
  const root = await rootService.getById(req.params.id, { withWords: true });
  return sendSuccess(res, root);
});

const create = asyncHandler(async (req, res) => {
  const root = await rootService.create(req.body, req.user?.id);
  return sendCreated(res, root, { message: 'Root created' });
});

const update = asyncHandler(async (req, res) => {
  const root = await rootService.update(req.params.id, req.body);
  return sendSuccess(res, root, { message: 'Root updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await rootService.remove(req.params.id);
  return sendSuccess(res, result, { message: 'Root deleted' });
});

module.exports = { list, essential, getById, create, update, remove };
