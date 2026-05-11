'use strict';

const Root = require('../models/Root');
const Word = require('../models/Word');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { normalizeArabic } = require('../utils/arabic');

async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.semanticField) filter.semanticField = query.semanticField;
  if (query.difficulty) filter.difficulty = Number(query.difficulty);
  if (typeof query.isEssential !== 'undefined')
    filter.isEssential = query.isEssential === true || query.isEssential === 'true';
  if (typeof query.isQuranic !== 'undefined')
    filter.isQuranic = query.isQuranic === true || query.isQuranic === 'true';

  if (query.search && String(query.search).trim()) {
    const search = String(query.search).trim();
    // Tente arabe normalisé d'abord, fallback regex sur transliteration.
    const arNorm = normalizeArabic(search);
    filter.$or = [
      { letters: { $regex: arNorm, $options: 'i' } },
      { transliteration: { $regex: search, $options: 'i' } },
      { transliterationSimplified: { $regex: search.toLowerCase(), $options: 'i' } },
      { 'coreMeaning.fr': { $regex: search, $options: 'i' } },
      { 'coreMeaning.en': { $regex: search, $options: 'i' } },
    ];
  }

  let sort = { frequency: -1, letters: 1 };
  if (query.sort) {
    const dir = query.sort.startsWith('-') ? -1 : 1;
    const field = query.sort.replace(/^-/, '');
    sort = { [field]: dir };
  }

  const [items, total] = await Promise.all([
    Root.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Root.countDocuments(filter),
  ]);

  return {
    data: items,
    pagination: buildPagination({ page, limit, total }),
  };
}

async function listEssential() {
  const items = await Root.find({ isEssential: true }).sort({ frequency: -1, letters: 1 }).lean();
  return items;
}

async function getById(id, { withWords = true } = {}) {
  const root = await Root.findById(id).lean();
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');
  if (withWords) {
    const words = await Word.find({ root: root._id }).sort({ isCommon: -1, difficulty: 1 }).lean();
    root.words = words;
  }
  return root;
}

async function create(payload, userId) {
  const exists = await Root.findOne({ letters: normalizeArabic(payload.letters) }).lean();
  if (exists) throw ApiError.conflict('Root already exists', undefined, 'ROOT_DUPLICATE');
  const root = await Root.create({ ...payload, createdBy: userId || null });
  return root.toJSON();
}

async function update(id, payload) {
  const root = await Root.findById(id);
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');
  Object.assign(root, payload);
  await root.save();
  return root.toJSON();
}

async function remove(id) {
  const root = await Root.findById(id);
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');
  await Word.deleteMany({ root: root._id });
  await root.deleteOne();
  return { ok: true };
}

module.exports = { list, listEssential, getById, create, update, remove };
