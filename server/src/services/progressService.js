'use strict';

const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Root = require('../models/Root');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { SRS_INTERVALS } = require('../utils/enums');
const { startOfDayInTz, addDaysInTz, toDateStringInTz } = require('../utils/timezone');

/** Map rating string to boolean success + optional interval multiplier. */
function resolveSuccess(rating, successFlag) {
  if (typeof rating === 'string') {
    if (rating === 'failed') return { success: false, multiplier: 1.0 };
    if (rating === 'hard') return { success: true, multiplier: 0.7 };
    if (rating === 'good') return { success: true, multiplier: 1.0 };
    if (rating === 'perfect') return { success: true, multiplier: 1.3 };
  }
  return { success: Boolean(successFlag), multiplier: 1.0 };
}

/**
 * Algorithme SM-2 simplifié (PLAN §5), timezone-aware.
 *   - success : masteryLevel++ (cap 5), intervalDays = SRS_INTERVALS[newLevel] * multiplier
 *   - échec   : masteryLevel-- (min 0), intervalDays = 1
 *   - nextReviewDate aligné sur minuit TZ user
 */
function nextScheduling(current, success, multiplier, userTz) {
  const tz = userTz || 'UTC';
  let masteryLevel = current?.masteryLevel ?? 0;
  let intervalDays;

  if (success) {
    masteryLevel = Math.min(5, masteryLevel + 1);
    const base = SRS_INTERVALS[masteryLevel] ?? SRS_INTERVALS[SRS_INTERVALS.length - 1];
    intervalDays = Math.max(1, Math.round(base * multiplier));
  } else {
    masteryLevel = Math.max(0, masteryLevel - 1);
    intervalDays = 1;
  }

  const now = new Date();
  const nextReviewDate = addDaysInTz(now, intervalDays, tz);
  return { masteryLevel, intervalDays, nextReviewDate, lastReviewed: now };
}

/**
 * Update streak on user after a review.
 * Logic: if lastActivityDate == today (TZ user) → noop
 *        if lastActivityDate == yesterday → streak++
 *        otherwise → streak reset to 1
 */
async function updateStreak(user, now) {
  const tz = user.timezone || 'UTC';
  const todayStr = toDateStringInTz(now, tz);
  const lastDate = user.streak?.lastActivityDate;
  const lastStr = lastDate ? toDateStringInTz(new Date(lastDate), tz) : null;

  if (lastStr === todayStr) {
    // Already active today — noop
    return;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStringInTz(yesterday, tz);

  let newCurrent;
  if (lastStr === yesterdayStr) {
    newCurrent = (user.streak?.current ?? 0) + 1;
  } else {
    newCurrent = 1;
  }

  const newLongest = Math.max(user.streak?.longest ?? 0, newCurrent);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        'streak.current': newCurrent,
        'streak.longest': newLongest,
        'streak.lastActivityDate': now,
      },
    },
  );
}

async function recordReview(userId, { rootId, rating, success: successFlag, wordsLearned }) {
  const root = await Root.findById(rootId).lean();
  if (!root) throw ApiError.notFound('Root not found', undefined, 'ROOT_NOT_FOUND');

  // Fetch user for timezone + streak
  const user = await User.findById(userId).select('+streak +timezone').lean();

  const { success, multiplier } = resolveSuccess(rating, successFlag);

  let progress = await Progress.findOne({ user: userId, root: rootId });
  const current = progress ? { masteryLevel: progress.masteryLevel } : { masteryLevel: 0 };

  const sched = nextScheduling(current, success, multiplier, user?.timezone);

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

  // Update streak (non-blocking on failure)
  if (user) {
    await updateStreak(user, sched.lastReviewed).catch(() => {});
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
  const user = await User.findById(userId).select('+streak +timezone').lean();
  const tz = user?.timezone || 'UTC';

  // Build 7-day window in user TZ
  const now = new Date();
  const todayStart = startOfDayInTz(now, tz);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const uid = new mongoose.Types.ObjectId(userId);

  const [totalRootsLearned, wordsAgg, weeklyAgg, activeDaysAgg] = await Promise.all([
    // Roots mastered: masteryLevel >= 3
    Progress.countDocuments({ user: userId, masteryLevel: { $gte: 3 } }),

    // Total unique words mastered across all progress docs
    Progress.aggregate([
      { $match: { user: uid } },
      { $project: { wordsLearned: 1 } },
      { $unwind: '$wordsLearned' },
      { $group: { _id: '$wordsLearned' } },
      { $count: 'total' },
    ]),

    // Weekly activity: reviews per day for last 7 days
    Progress.aggregate([
      { $match: { user: uid, lastReviewed: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastReviewed', timezone: tz } },
          count: { $sum: '$reviewCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Active days: distinct days with at least one review
    Progress.aggregate([
      { $match: { user: uid, lastReviewed: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastReviewed', timezone: tz } },
        },
      },
      { $count: 'total' },
    ]),
  ]);

  // Fill in all 7 days (including zeros)
  const weeklyMap = {};
  weeklyAgg.forEach((row) => {
    weeklyMap[row._id] = row.count;
  });
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const dateStr = toDateStringInTz(d, tz);
    weeklyActivity.push({ date: dateStr, count: weeklyMap[dateStr] ?? 0 });
  }

  const totalWordsMastered = wordsAgg[0]?.total ?? 0;
  const activeDays = activeDaysAgg[0]?.total ?? 0;
  const streak = user?.streak?.current ?? 0;

  return {
    totalRootsLearned,
    totalWordsMastered,
    streak,
    activeDays,
    weeklyActivity,
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
