'use strict';

const mongoose = require('mongoose');
const { normalizeArabic } = require('../utils/arabic');
const { SEMANTIC_FIELDS } = require('../utils/enums');

const { Schema } = mongoose;

const rootSchema = new Schema(
  {
    letters: { type: String, required: true, trim: true }, // "ك-ت-ب"
    lettersArray: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 5,
        message: 'lettersArray must contain 2..5 letters',
      },
    },
    transliteration: { type: String, required: true, trim: true },
    transliterationSimplified: { type: String, lowercase: true, trim: true, index: true },
    coreMeaning: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, trim: true, maxlength: 200 },
    },
    semanticField: {
      type: String,
      required: true,
      enum: SEMANTIC_FIELDS,
    },
    frequency: { type: Number, default: 0, min: 0 },
    difficulty: { type: Number, default: 3, min: 1, max: 5 },
    isEssential: { type: Boolean, default: false },
    isQuranic: { type: Boolean, default: false },
    wordsCount: { type: Number, default: 0, min: 0 }, // dénormalisé
    metadata: {
      quranOccurrences: { type: Number, default: 0, min: 0 },
      msaFrequencyRank: { type: Number, default: null },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Indexes
rootSchema.index({ letters: 1 }, { unique: true });
rootSchema.index({ lettersArray: 1 });
rootSchema.index({ semanticField: 1, difficulty: 1 });
rootSchema.index({ isEssential: 1, frequency: -1 });
rootSchema.index({
  transliteration: 'text',
  transliterationSimplified: 'text',
  'coreMeaning.fr': 'text',
  'coreMeaning.en': 'text',
});

rootSchema.pre('validate', function preValidate(next) {
  if (this.letters) {
    this.letters = normalizeArabic(this.letters);
    this.lettersArray = this.letters
      .split('-')
      .map((l) => normalizeArabic(l))
      .filter(Boolean);
  }
  if (this.transliteration && !this.transliterationSimplified) {
    this.transliterationSimplified = String(this.transliteration)
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }
  next();
});

// Virtual : populate inverse Word→Root
rootSchema.virtual('words', {
  ref: 'Word',
  localField: '_id',
  foreignField: 'root',
});

const Root = mongoose.model('Root', rootSchema);
module.exports = Root;
