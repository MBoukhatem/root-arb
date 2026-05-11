'use strict';

const Word = require('../models/Word');
const Root = require('../models/Root');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');

async function getById(id) {
  const word = await Word.findById(id)
    .populate('root', 'letters transliteration semanticField')
    .lean();
  if (!word) throw ApiError.notFound('Word not found', undefined, 'WORD_NOT_FOUND');
  return word;
}

async function listByRoot(rootId, query) {
  const root = await Root.findById(rootId).lean();
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');

  const { page, limit, skip } = parsePagination(query);
  const filter = { root: rootId };
  if (query.grammaticalCategory) filter.grammaticalCategory = query.grammaticalCategory;
  if (typeof query.isCommon !== 'undefined') {
    filter.isCommon = query.isCommon === true || query.isCommon === 'true';
  }
  if (query.difficulty) filter.difficulty = Number(query.difficulty);

  const [items, total] = await Promise.all([
    Word.find(filter)
      .sort({ isCommon: -1, difficulty: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Word.countDocuments(filter),
  ]);

  return {
    data: items,
    pagination: buildPagination({ page, limit, total }),
  };
}

async function create(payload) {
  const root = await Root.findById(payload.root);
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');
  const word = await Word.create(payload);
  return word.toJSON();
}

async function update(id, payload) {
  const word = await Word.findById(id);
  if (!word) throw ApiError.notFound('Word not found', undefined, 'WORD_NOT_FOUND');
  Object.assign(word, payload);
  await word.save();
  return word.toJSON();
}

async function remove(id) {
  const word = await Word.findById(id);
  if (!word) throw ApiError.notFound('Word not found', undefined, 'WORD_NOT_FOUND');
  await word.deleteOne();
  return { ok: true };
}

module.exports = { getById, listByRoot, create, update, remove };
