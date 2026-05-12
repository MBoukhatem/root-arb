'use strict';

const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');

const SANITIZE_OPTS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'code', 'p', 'br'],
  allowedAttributes: { a: ['href'] },
};

function sanitizeContent(content) {
  return sanitizeHtml(content, SANITIZE_OPTS);
}

async function list(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  // Si isPublic=true → feed public ; sinon mes notes
  if (query.isPublic === 'true' || query.isPublic === true) {
    filter.isPublic = true;
  } else {
    filter.user = userId;
  }
  if (query.targetType) filter.targetType = query.targetType;
  if (query.target) filter.target = query.target;
  if (query.type) filter.type = query.type;

  const [items, total] = await Promise.all([
    Note.find(filter)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Note.countDocuments(filter),
  ]);
  return { data: items, pagination: buildPagination({ page, limit, total }) };
}

async function getById(id, userId) {
  const note = await Note.findById(id).populate('user', 'username avatar').lean();
  if (!note) throw ApiError.notFound('Note not found', undefined, 'NOTE_NOT_FOUND');
  if (!note.isPublic && String(note.user._id || note.user) !== String(userId)) {
    throw ApiError.forbidden('Cannot access private note', undefined, 'FORBIDDEN');
  }
  return note;
}

async function create(userId, payload) {
  const sanitized =
    payload.content !== undefined
      ? { ...payload, content: sanitizeContent(payload.content) }
      : payload;
  const note = await Note.create({ ...sanitized, user: userId });
  return note.toJSON();
}

async function update(userId, id, payload) {
  const note = await Note.findOne({ _id: id, user: userId });
  if (!note) throw ApiError.notFound('Note not found', undefined, 'NOTE_NOT_FOUND');
  const sanitized =
    payload.content !== undefined
      ? { ...payload, content: sanitizeContent(payload.content) }
      : payload;
  Object.assign(note, sanitized);
  await note.save();
  return note.toJSON();
}

async function remove(userId, id) {
  const res = await Note.deleteOne({ _id: id, user: userId });
  if (!res.deletedCount) throw ApiError.notFound('Note not found', undefined, 'NOTE_NOT_FOUND');
  return { ok: true };
}

async function toggleLike(userId, id) {
  const note = await Note.findById(id);
  if (!note) throw ApiError.notFound('Note not found', undefined, 'NOTE_NOT_FOUND');
  if (!note.isPublic && String(note.user) !== String(userId)) {
    throw ApiError.forbidden('Cannot like private note', undefined, 'FORBIDDEN');
  }
  const uid = new mongoose.Types.ObjectId(userId);
  const idx = note.likes.findIndex((u) => String(u) === String(userId));
  let liked;
  if (idx >= 0) {
    note.likes.splice(idx, 1);
    note.likesCount = Math.max(0, note.likesCount - 1);
    liked = false;
  } else {
    note.likes.push(uid);
    note.likesCount += 1;
    liked = true;
  }
  await note.save();
  return { liked, likesCount: note.likesCount };
}

module.exports = { list, getById, create, update, remove, toggleLike };
