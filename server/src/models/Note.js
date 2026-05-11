'use strict';

const mongoose = require('mongoose');
const { NOTE_TYPES, NOTE_TARGET_TYPES } = require('../utils/enums');

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: NOTE_TARGET_TYPES, required: true },
    target: { type: Schema.Types.ObjectId, refPath: 'targetType', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: NOTE_TYPES, default: 'general' },
    isPublic: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ targetType: 1, target: 1 });
noteSchema.index({ isPublic: 1, likesCount: -1, createdAt: -1 });

// Anti-orphelines : vérifie que la cible existe
noteSchema.pre('validate', async function preValidate() {
  if (!this.targetType || !this.target) return;
  const Model = mongoose.model(this.targetType);
  const exists = await Model.exists({ _id: this.target });
  if (!exists) {
    this.invalidate('target', `Target ${this.targetType} not found`);
  }
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
