'use strict';

const mongoose = require('mongoose');
const { nfc, normalizeArabic, simplifyTranslit } = require('../utils/arabic');
const { GRAMMATICAL_CATEGORIES } = require('../utils/enums');

const { Schema } = mongoose;

const exampleSchema = new Schema(
  {
    sentence: { type: String, required: true, maxlength: 500 },
    sentenceUnvocalized: { type: String, maxlength: 500 },
    translation: {
      fr: { type: String, required: true, maxlength: 500 },
      en: { type: String, required: true, maxlength: 500 },
      ar: { type: String, maxlength: 500 },
    },
  },
  { _id: false },
);

const wordSchema = new Schema(
  {
    arabicWord: { type: String, required: true, trim: true },
    arabicWordUnvocalized: { type: String, required: true, trim: true, index: true },
    transliteration: { type: String, required: true, trim: true },
    transliterationSimplified: { type: String, trim: true, lowercase: true, index: true },
    translations: {
      fr: { type: String, required: true, trim: true, maxlength: 300 },
      en: { type: String, required: true, trim: true, maxlength: 300 },
      ar: { type: String, trim: true, maxlength: 300 },
    },
    root: { type: Schema.Types.ObjectId, ref: 'Root', required: true },
    pattern: { type: String, required: true, trim: true },
    patternDescription: {
      fr: { type: String, maxlength: 300 },
      en: { type: String, maxlength: 300 },
      ar: { type: String, maxlength: 300 },
    },
    grammaticalCategory: {
      type: String,
      required: true,
      enum: GRAMMATICAL_CATEGORIES,
    },
    examples: { type: [exampleSchema], default: [] },
    difficulty: { type: Number, default: 3, min: 1, max: 5 },
    isCommon: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes
wordSchema.index({ root: 1 });
wordSchema.index({ grammaticalCategory: 1 });
wordSchema.index({ isCommon: 1, difficulty: 1 });
wordSchema.index({
  arabicWordUnvocalized: 'text',
  transliteration: 'text',
  transliterationSimplified: 'text',
  'translations.fr': 'text',
  'translations.en': 'text',
});

wordSchema.pre('validate', function preValidate(next) {
  if (this.arabicWord) {
    this.arabicWord = nfc(this.arabicWord);
    if (!this.arabicWordUnvocalized) {
      this.arabicWordUnvocalized = normalizeArabic(this.arabicWord);
    } else {
      this.arabicWordUnvocalized = normalizeArabic(this.arabicWordUnvocalized);
    }
  }
  if (this.transliteration && !this.transliterationSimplified) {
    this.transliterationSimplified = simplifyTranslit(this.transliteration);
  }
  if (Array.isArray(this.examples)) {
    this.examples.forEach((ex) => {
      if (ex.sentence) ex.sentence = nfc(ex.sentence);
      if (!ex.sentenceUnvocalized && ex.sentence) {
        ex.sentenceUnvocalized = normalizeArabic(ex.sentence);
      } else if (ex.sentenceUnvocalized) {
        ex.sentenceUnvocalized = normalizeArabic(ex.sentenceUnvocalized);
      }
    });
  }
  next();
});

// Hook wordsCount dénormalisé
wordSchema.post('save', async function postSave(doc) {
  try {
    if (doc.wasNew) {
      await mongoose.model('Root').updateOne({ _id: doc.root }, { $inc: { wordsCount: 1 } });
    }
  } catch (_err) {
    // log silencieux ; reconcileCounters cron remettra droit
  }
});

wordSchema.pre('save', function flagNew(next) {
  this.wasNew = this.isNew;
  next();
});

wordSchema.post('deleteOne', { document: true, query: false }, async function postDelete() {
  try {
    await mongoose.model('Root').updateOne({ _id: this.root }, { $inc: { wordsCount: -1 } });
  } catch (_err) {
    /* ignore */
  }
});

const Word = mongoose.model('Word', wordSchema);
module.exports = Word;
