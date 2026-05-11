'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/formatResponse');
const Progress = require('../models/Progress');
const Root = require('../models/Root');
const Word = require('../models/Word');
const Note = require('../models/Note');
const Collection = require('../models/Collection');
const progressService = require('../services/progressService');

/** Constellation : nodes (Progress masteryLevel>=1) + links (same semanticField). */
const constellation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const progresses = await Progress.find({ user: userId, masteryLevel: { $gte: 1 } })
    .populate('root', 'letters transliteration semanticField')
    .lean();

  const nodes = progresses
    .filter((p) => p.root)
    .map((p) => ({
      id: String(p.root._id),
      letters: p.root.letters,
      transliteration: p.root.transliteration,
      semanticField: p.root.semanticField,
      masteryLevel: p.masteryLevel,
    }));

  // Links : paires de racines de même semanticField (unique, sans self-loop).
  const byField = {};
  nodes.forEach((n) => {
    if (!byField[n.semanticField]) byField[n.semanticField] = [];
    byField[n.semanticField].push(n.id);
  });

  const links = [];
  Object.values(byField).forEach((ids) => {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        links.push({ source: ids[i], target: ids[j] });
      }
    }
  });

  const fields = Object.keys(byField);

  return sendSuccess(res, {
    nodes,
    links,
    meta: { total: nodes.length, fields },
  });
});

/** Dashboard stats : agrégat global utilisateur + globals contenu. */
const dashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [userStats, totalRoots, totalWords, myNotes, myCollections] = await Promise.all([
    progressService.stats(userId),
    Root.countDocuments({}),
    Word.countDocuments({}),
    Note.countDocuments({ user: userId }),
    Collection.countDocuments({ user: userId }),
  ]);
  return sendSuccess(res, {
    user: userStats,
    content: { totalRoots, totalWords },
    library: { notes: myNotes, collections: myCollections },
  });
});

module.exports = { constellation, dashboard };
