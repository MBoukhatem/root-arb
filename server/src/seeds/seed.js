'use strict';

/**
 * Script de seed standalone.
 *   npm run seed             — append (no-op si datas déjà présentes)
 *   npm run seed -- --reset  — wipe collections puis re-seed
 *
 * Auto-utilisé par seedOnBoot.js si DB vide en in-memory mode.
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const env = require('../config/env');
const logger = require('../config/logger');
const { connectWithRetry, disconnect } = require('../config/db');
const User = require('../models/User');
const Root = require('../models/Root');
const Word = require('../models/Word');

const ROOTS_FILE = path.join(__dirname, 'data', 'roots.json');
const WORDS_FILE = path.join(__dirname, 'data', 'words.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function ensureAdmin() {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    logger.warn('[seed] SEED_ADMIN_EMAIL/PASSWORD non set — skip admin');
    return null;
  }
  const exists = await User.findOne({ email: env.SEED_ADMIN_EMAIL })
    .collation({ locale: 'en', strength: 2 })
    .lean();
  if (exists) {
    logger.info({ email: env.SEED_ADMIN_EMAIL }, '[seed] admin already exists');
    return exists;
  }
  const admin = await User.create({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    username: 'admin',
    role: 'admin',
    nativeLanguage: 'fr',
    learningLevel: 'advanced',
    learningGoal: 'general',
  });
  logger.info({ id: String(admin._id) }, '[seed] admin created');
  return admin.toJSON();
}

async function seedRoots(rootsData, adminId) {
  const map = new Map(); // letters -> _id
  for (const r of rootsData) {
    const existing = await Root.findOne({ letters: r.letters }).lean();
    if (existing) {
      map.set(r.letters, existing._id);
      continue;
    }
    const doc = await Root.create({ ...r, createdBy: adminId || null });
    map.set(r.letters, doc._id);
  }
  return map;
}

async function seedWords(wordsData, rootMap) {
  let inserted = 0;
  let skipped = 0;
  for (const w of wordsData) {
    const rootId = rootMap.get(w.rootLetters);
    if (!rootId) {
      logger.warn({ word: w.arabicWord, root: w.rootLetters }, '[seed] root not found, skipping');
      skipped += 1;
      continue;
    }
    // Anti-doublon : check arabicWord + root
    const exists = await Word.findOne({ arabicWord: w.arabicWord, root: rootId }).lean();
    if (exists) {
      skipped += 1;
      continue;
    }
    const payload = { ...w, root: rootId };
    delete payload.rootLetters;
    await Word.create(payload);
    inserted += 1;
  }
  return { inserted, skipped };
}

async function reconcileWordsCount() {
  const rootIds = await Root.find({}, '_id').lean();
  for (const r of rootIds) {
    const count = await Word.countDocuments({ root: r._id });
    await Root.updateOne({ _id: r._id }, { $set: { wordsCount: count } });
  }
}

async function runSeed({ reset = false } = {}) {
  const rootsData = readJson(ROOTS_FILE);
  const wordsData = readJson(WORDS_FILE);

  if (reset) {
    logger.warn('[seed] --reset : wiping Root & Word collections');
    await Word.deleteMany({});
    await Root.deleteMany({});
  }

  const admin = await ensureAdmin();
  const adminId = admin ? admin._id : null;

  const rootMap = await seedRoots(rootsData, adminId);
  logger.info({ roots: rootMap.size }, '[seed] roots ready');

  const { inserted, skipped } = await seedWords(wordsData, rootMap);
  logger.info({ inserted, skipped }, '[seed] words ready');

  await reconcileWordsCount();

  const totals = {
    users: await User.countDocuments({}),
    roots: await Root.countDocuments({}),
    words: await Word.countDocuments({}),
  };
  logger.info(totals, '[seed] done — totals');
  return totals;
}

async function main() {
  const reset = process.argv.includes('--reset');
  try {
    await connectWithRetry();
    await runSeed({ reset });
  } catch (err) {
    logger.fatal({ err: err.message, stack: err.stack }, '[seed] failed');
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

// Auto-run uniquement si CLI direct, sinon export runSeed.
if (require.main === module) {
  main();
}

module.exports = { runSeed };
