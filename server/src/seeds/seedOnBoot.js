'use strict';

const logger = require('../config/logger');
const Root = require('../models/Root');
const { runSeed } = require('./seed');

/**
 * Auto-seed au boot — uniquement si la DB Root est vide.
 * Appelé depuis server.js conditionnel à USE_MEMORY_DB.
 */
async function seedIfEmpty() {
  try {
    const count = await Root.estimatedDocumentCount();
    if (count > 0) {
      logger.info({ rootsCount: count }, '[seedOnBoot] DB already populated, skipping');
      return;
    }
    logger.info('[seedOnBoot] empty DB detected, running seed...');
    await runSeed({ reset: false });
    logger.info('[seedOnBoot] auto-seed complete');
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, '[seedOnBoot] failed (non-fatal)');
  }
}

module.exports = { seedIfEmpty };
