'use strict';

/**
 * Copie CJS des enums shared/ (ESM-only) — TODO unifier build pipeline.
 */

const SEMANTIC_FIELDS = Object.freeze([
  'knowledge',
  'action',
  'place',
  'emotion',
  'movement',
  'time',
  'social',
  'nature',
  'body',
  'spiritual',
  'communication',
]);

const GRAMMATICAL_CATEGORIES = Object.freeze([
  'verb',
  'noun',
  'adjective',
  'place',
  'agent',
  'instrument',
  'verbal_noun',
  'participle',
]);

const NOTE_TYPES = Object.freeze(['mnemonic', 'context', 'cultural', 'grammar', 'general']);
const NOTE_TARGET_TYPES = Object.freeze(['Root', 'Word']);
const MASTERY_LEVELS = Object.freeze([0, 1, 2, 3, 4, 5]);

// Intervalles SM-2 simplifiés (PLAN §5)
const SRS_INTERVALS = Object.freeze([1, 3, 7, 14, 30, 90]);

module.exports = {
  SEMANTIC_FIELDS,
  GRAMMATICAL_CATEGORIES,
  NOTE_TYPES,
  NOTE_TARGET_TYPES,
  MASTERY_LEVELS,
  SRS_INTERVALS,
};
