'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const progressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    root: { type: Schema.Types.ObjectId, ref: 'Root', required: true },
    masteryLevel: { type: Number, default: 0, min: 0, max: 5 },
    wordsLearned: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
    reviewCount: { type: Number, default: 0, min: 0 },
    successCount: { type: Number, default: 0, min: 0 },
    failureCount: { type: Number, default: 0, min: 0 },
    lastReviewed: { type: Date, default: null },
    nextReviewDate: { type: Date, default: () => new Date(), index: true },
    intervalDays: { type: Number, default: 0, min: 0 },
    easinessFactor: { type: Number, default: 2.5, min: 1.3 },
    notes: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Indexes
progressSchema.index({ user: 1, root: 1 }, { unique: true });
progressSchema.index({ user: 1, nextReviewDate: 1 });
progressSchema.index({ user: 1, masteryLevel: 1 });

progressSchema.virtual('successRate').get(function getter() {
  const total = this.reviewCount || 0;
  if (!total) return 0;
  return Math.round((this.successCount / Math.max(total, 1)) * 100);
});

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
