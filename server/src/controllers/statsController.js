'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/formatResponse');
const Progress = require('../models/Progress');
const Root = require('../models/Root');
const Word = require('../models/Word');
const Note = require('../models/Note');
const Collection = require('../models/Collection');
const progressService = require('../services/progressService');

/** Constellation : nodes (Progress masteryLevel>=1) + links (same semanticField).
 *  Query params:
 *    includeUnstudied=true  → inclure aussi masteryLevel 0
 *  Fallback : si l'utilisateur n'a aucune progression, renvoie les racines
 *  isEssential:true en mode "preview" (masteryLevel=0). */
const constellation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const includeUnstudied = req.query.includeUnstudied === 'true';

  const progressFilter = { user: userId };
  if (!includeUnstudied) progressFilter.masteryLevel = { $gte: 1 };

  const progresses = await Progress.find(progressFilter)
    .populate('root', 'letters transliteration semanticField')
    .lean();

  let nodes = progresses
    .filter((p) => p.root)
    .map((p) => ({
      id: String(p.root._id),
      letters: p.root.letters,
      transliteration: p.root.transliteration,
      semanticField: p.root.semanticField,
      masteryLevel: p.masteryLevel,
    }));

  // Fallback preview : aucune progression → toutes les racines essentielles à masteryLevel 0
  let isPreview = false;
  if (nodes.length === 0) {
    const essentialRoots = await Root.find({ isEssential: true })
      .select('letters transliteration semanticField')
      .lean();
    nodes = essentialRoots.map((r) => ({
      id: String(r._id),
      letters: r.letters,
      transliteration: r.transliteration,
      semanticField: r.semanticField,
      masteryLevel: 0,
    }));
    isPreview = true;
  }

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
    meta: { total: nodes.length, fields, isPreview },
  });
});

/** Dashboard stats : agrégat global utilisateur + globals contenu.
 *  Retourne le contrat attendu par DashboardPage.tsx :
 *  { user, content, library, totalRootsLearned, totalWordsMastered, streak, activeDays, weeklyActivity }
 */
const dashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [userStats, totalRoots, totalWords, myNotes, myCollections] = await Promise.all([
    progressService.stats(userId),
    Root.countDocuments({}),
    Word.countDocuments({}),
    Note.countDocuments({ user: userId }),
    Collection.countDocuments({ user: userId }),
  ]);

  // userStats shape: { totalRootsLearned, totalWordsMastered, streak, activeDays, weeklyActivity }
  return sendSuccess(res, {
    user: {
      streak: userStats.streak,
      activeDays: userStats.activeDays,
    },
    content: {
      totalRoots,
      totalWords,
      totalRootsLearned: userStats.totalRootsLearned,
      totalWordsMastered: userStats.totalWordsMastered,
      weeklyActivity: userStats.weeklyActivity,
    },
    library: { notes: myNotes, collections: myCollections },
    // Flat fields consumed directly by /progress/stats via useProgressStats()
    totalRootsLearned: userStats.totalRootsLearned,
    totalWordsMastered: userStats.totalWordsMastered,
    streak: userStats.streak,
    activeDays: userStats.activeDays,
    weeklyActivity: userStats.weeklyActivity,
  });
});

module.exports = { constellation, dashboard };
