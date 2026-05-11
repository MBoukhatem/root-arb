'use strict';

const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Root = require('../models/Root');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { SRS_INTERVALS } = require('../utils/enums');

/**
 * Algorithme SM-2 simplifié (PLAN §5).
 *   - success : masteryLevel++ (cap 5), intervalDays = SRS_INTERVALS[newLevel]
 *   - échec   : masteryLevel-- (min 0), intervalDays = 1
 *   - nextReviewDate = now + intervalDays
 */
function nextScheduling(current, success) {
  let masteryLevel = current?.masteryLevel ?? 0;
  let intervalDays;

  if (success) {
    masteryLevel = Math.min(5, masteryLevel + 1);
    intervalDays = SRS_INTERVALS[masteryLevel] ?? SRS_INTERVALS[SRS_INTERVALS.length - 1];
  } else {
    masteryLevel = Math.max(0, masteryLevel - 1);
    intervalDays = 1;
  }

  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return { masteryLevel, intervalDays, nextReviewDate, lastReviewed: now };
}

async function recordReview(userId, { rootId, success, wordsLearned }) {
  const root = await Root.findById(rootId).lean();
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');

  let progress = await Progress.findOne({ user: userId, root: rootId });
  const current = progress ? { masteryLevel: progress.masteryLevel } : { masteryLevel: 0 };

  const sched = nextScheduling(current, success);

  if (!progress) {
    progress = await Progress.create({
      user: userId,
      root: rootId,
      masteryLevel: sched.masteryLevel,
      intervalDays: sched.intervalDays,
      nextReviewDate: sched.nextReviewDate,
      lastReviewed: sched.lastReviewed,
      reviewCount: 1,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      wordsLearned: Array.isArray(wordsLearned) ? wordsLearned : [],
    });
  } else {
    progress.masteryLevel = sched.masteryLevel;
    progress.intervalDays = sched.intervalDays;
    progress.nextReviewDate = sched.nextReviewDate;
    progress.lastReviewed = sched.lastReviewed;
    progress.reviewCount += 1;
    if (success) progress.successCount += 1;
    else progress.failureCount += 1;
    if (Array.isArray(wordsLearned) && wordsLearned.length) {
      const set = new Set(progress.wordsLearned.map(String));
      wordsLearned.forEach((id) => set.add(String(id)));
      progress.wordsLearned = Array.from(set).map((id) => new mongoose.Types.ObjectId(id));
    }
    await progress.save();
  }
  return progress.toJSON();
}

async function list(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };
  if (typeof query.masteryLevel !== 'undefined') {
    filter.masteryLevel = Number(query.masteryLevel);
  }
  const [items, total] = await Promise.all([
    Progress.find(filter)
      .populate('root', 'letters transliteration semanticField coreMeaning')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Progress.countDocuments(filter),
  ]);
  return { data: items, pagination: buildPagination({ page, limit, total }) };
}

async function today(userId) {
  const now = new Date();
  const items = await Progress.find({ user: userId, nextReviewDate: { $lte: now } })
    .populate('root', 'letters transliteration semanticField coreMeaning')
    .sort({ nextReviewDate: 1 })
    .lean({ virtuals: true });
  return { rootsToReview: items, count: items.length };
}

async function stats(userId) {
  const [byLevel, totalRoots, totalReviews] = await Promise.all([
    Progress.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$masteryLevel', count: { $sum: 1 } } },
    ]),
    Progress.countDocuments({ user: userId }),
    Progress.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: '$reviewCount' },
          totalSuccess: { $sum: '$successCount' },
          totalFailure: { $sum: '$failureCount' },
        },
      },
    ]),
  ]);

  const levels = {};
  byLevel.forEach((row) => {
    levels[row._id] = row.count;
  });

  const agg = totalReviews[0] || { totalReviews: 0, totalSuccess: 0, totalFailure: 0 };
  const successRate = agg.totalReviews
    ? Math.round((agg.totalSuccess / agg.totalReviews) * 100)
    : 0;

  return {
    totalRootsStudied: totalRoots,
    levels,
    reviews: {
      total: agg.totalReviews,
      success: agg.totalSuccess,
      failure: agg.totalFailure,
      successRate,
    },
  };
}

async function update(userId, id, payload) {
  const progress = await Progress.findOne({ _id: id, user: userId });
  if (!progress) throw ApiError.notFound('Progress not found', undefined, 'PROGRESS_NOT_FOUND');
  if (typeof payload.masteryLevel !== 'undefined') progress.masteryLevel = payload.masteryLevel;
  if (typeof payload.notes !== 'undefined') progress.notes = payload.notes;
  if (Array.isArray(payload.wordsLearned)) progress.wordsLearned = payload.wordsLearned;
  await progress.save();
  return progress.toJSON();
}

async function remove(userId, id) {
  const res = await Progress.deleteOne({ _id: id, user: userId });
  if (!res.deletedCount) {
    throw ApiError.notFound('Progress not found', undefined, 'PROGRESS_NOT_FOUND');
  }
  return { ok: true };
}

module.exports = { recordReview, list, today, stats, update, remove, nextScheduling };
