'use strict';

const Root = require('../models/Root');
const { normalizeArabic } = require('../utils/arabic');

// Ordered list of the 28 Arabic letters (Unicode order matches ء-ي range)
const ARABIC_LETTERS_28 = [
  'ء',
  'آ',
  'أ',
  'ؤ',
  'إ',
  'ئ',
  'ا',
  'ب',
  'ت',
  'ث',
  'ج',
  'ح',
  'خ',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ع',
  'غ',
  'ف',
  'ق',
  'ك',
  'ل',
  'م',
  'ن',
  'ه',
  'و',
  'ى',
  'ي',
];

/**
 * Get co-occurrences of a given Arabic letter across all roots.
 *
 * @param {string} letter      - Single Arabic letter (already NFC-validated by Joi)
 * @param {object} opts
 * @param {number} opts.limit       - max co-occurrences to return (1..27, default 27)
 * @param {number} opts.minCount    - filter entries with count < minCount (default 1)
 * @param {boolean} opts.includeRoots - whether to populate sharedRootIds (default false)
 * @returns {Promise<object>}
 */
async function getCooccurrences(letter, { limit = 27, minCount = 1, includeRoots = false } = {}) {
  const letterNFC = normalizeArabic(letter);

  const pipeline = [
    { $match: { lettersArray: letterNFC } },
    { $project: { _id: 1, lettersArray: 1 } },
    { $unwind: '$lettersArray' },
    { $match: { lettersArray: { $ne: letterNFC } } },
    {
      $group: {
        _id: '$lettersArray',
        count: { $sum: 1 },
        sharedRootIds: { $addToSet: '$_id' },
      },
    },
    { $match: { count: { $gte: minCount } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
  ];

  const [aggregated, totalRootsWithLetter] = await Promise.all([
    Root.aggregate(pipeline),
    Root.countDocuments({ lettersArray: letterNFC }),
  ]);

  const cooccurrences = aggregated.map((entry) => ({
    letter: entry._id,
    count: entry.count,
    sharedRootIds: includeRoots ? entry.sharedRootIds.map(String) : [],
  }));

  return {
    letter: letterNFC,
    totalRootsWithLetter,
    cooccurrences,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Return all 28 Arabic letters with their root count.
 *
 * @returns {Promise<Array<{letter: string, count: number}>>}
 */
async function listLetters() {
  const pipeline = [
    { $project: { lettersArray: 1 } },
    { $unwind: '$lettersArray' },
    {
      $group: {
        _id: '$lettersArray',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const results = await Root.aggregate(pipeline);
  const countMap = new Map(results.map((r) => [r._id, r.count]));

  return ARABIC_LETTERS_28.map((l) => ({
    letter: l,
    count: countMap.get(l) ?? 0,
  }));
}

module.exports = { getCooccurrences, listLetters };
