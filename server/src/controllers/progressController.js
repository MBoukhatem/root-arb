'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const progressService = require('../services/progressService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await progressService.list(req.user.id, req.query);
  return sendSuccess(res, data, { pagination });
});

const today = asyncHandler(async (req, res) => {
  const data = await progressService.today(req.user.id);
  return sendSuccess(res, data);
});

const stats = asyncHandler(async (req, res) => {
  const data = await progressService.stats(req.user.id);
  return sendSuccess(res, data);
});

const recordReview = asyncHandler(async (req, res) => {
  const progress = await progressService.recordReview(req.user.id, req.body);
  return sendCreated(res, progress, { message: 'Review recorded' });
});

const update = asyncHandler(async (req, res) => {
  const progress = await progressService.update(req.user.id, req.params.id, req.body);
  return sendSuccess(res, progress, { message: 'Progress updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await progressService.remove(req.user.id, req.params.id);
  return sendSuccess(res, result, { message: 'Progress deleted' });
});

module.exports = { list, today, stats, recordReview, update, remove };
