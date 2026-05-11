'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const noteService = require('../services/noteService');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await noteService.list(req.user.id, req.query);
  return sendSuccess(res, data, { pagination });
});

const getById = asyncHandler(async (req, res) => {
  const note = await noteService.getById(req.params.id, req.user.id);
  return sendSuccess(res, note);
});

const create = asyncHandler(async (req, res) => {
  const note = await noteService.create(req.user.id, req.body);
  return sendCreated(res, note, { message: 'Note created' });
});

const update = asyncHandler(async (req, res) => {
  const note = await noteService.update(req.user.id, req.params.id, req.body);
  return sendSuccess(res, note, { message: 'Note updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await noteService.remove(req.user.id, req.params.id);
  return sendSuccess(res, result, { message: 'Note deleted' });
});

const toggleLike = asyncHandler(async (req, res) => {
  const result = await noteService.toggleLike(req.user.id, req.params.id);
  return sendSuccess(res, result);
});

module.exports = { list, getById, create, update, remove, toggleLike };
