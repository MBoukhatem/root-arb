'use strict';

const Collection = require('../models/Collection');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');

async function list(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.isPublic === 'true' || query.isPublic === true) {
    filter.isPublic = true;
  } else {
    filter.user = userId;
  }
  const [items, total] = await Promise.all([
    Collection.find(filter)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Collection.countDocuments(filter),
  ]);
  return { data: items, pagination: buildPagination({ page, limit, total }) };
}

async function getById(id, userId) {
  const col = await Collection.findById(id)
    .populate('user', 'username avatar')
    .populate('roots', 'letters transliteration semanticField coreMeaning')
    .lean();
  if (!col) throw ApiError.notFound('Collection not found', undefined, 'COLLECTION_NOT_FOUND');
  if (!col.isPublic && String(col.user._id || col.user) !== String(userId)) {
    throw ApiError.forbidden('Cannot access private collection', undefined, 'FORBIDDEN');
  }
  return col;
}

async function create(userId, payload) {
  const col = await Collection.create({ ...payload, user: userId });
  return col.toJSON();
}

async function update(userId, id, payload) {
  const col = await Collection.findOne({ _id: id, user: userId });
  if (!col) throw ApiError.notFound('Collection not found', undefined, 'COLLECTION_NOT_FOUND');
  Object.assign(col, payload);
  await col.save();
  return col.toJSON();
}

async function remove(userId, id) {
  const res = await Collection.deleteOne({ _id: id, user: userId });
  if (!res.deletedCount) {
    throw ApiError.notFound('Collection not found', undefined, 'COLLECTION_NOT_FOUND');
  }
  return { ok: true };
}

module.exports = { list, getById, create, update, remove };
