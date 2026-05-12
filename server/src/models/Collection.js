'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function shortId(len = 6) {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

const collectionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    roots: [{ type: Schema.Types.ObjectId, ref: 'Root' }],
    isPublic: { type: Boolean, default: false },
    coverColor: { type: String, match: /^#[0-9a-fA-F]{6}$/, default: '#4F46E5' },
    icon: { type: String, default: '📚' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

collectionSchema.index({ user: 1, createdAt: -1 });
collectionSchema.index({ user: 1, slug: 1 }, { unique: true });
collectionSchema.index({ isPublic: 1, createdAt: -1 });

collectionSchema.pre('validate', function preValidate(next) {
  if (!this.slug && this.name) {
    this.slug = `${slugify(this.name) || 'collection'}-${shortId(6)}`;
  }
  next();
});

const Collection = mongoose.model('Collection', collectionSchema);
module.exports = Collection;
