/**
 * Shared TypeScript models aligned with PLAN_FINAL §3 (6 collections).
 *
 * These types mirror the backend Mongoose schemas. The shared workspace
 * (`@shared`) will own the enum constants later; for now we declare them
 * here so the frontend can typecheck independently of the backend wiring.
 */

// ---------------------------------------------------------------------------
// Enums (PLAN_FINAL §3 + design/round3 agents)
// ---------------------------------------------------------------------------

export const SEMANTIC_FIELDS = [
  'knowledge',
  'action',
  'movement',
  'state',
  'place',
  'time',
  'person',
  'communication',
  'emotion',
  'object',
] as const;
export type SemanticField = (typeof SEMANTIC_FIELDS)[number];

export const GRAMMATICAL_CATEGORIES = [
  'verb',
  'noun',
  'adjective',
  'adverb',
  'participle',
  'masdar',
  'pluriel-brise',
  'derive',
] as const;
export type GrammaticalCategory = (typeof GRAMMATICAL_CATEGORIES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const NOTE_TYPES = ['mnemonic', 'context', 'cultural', 'grammar', 'general'] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const REVIEW_RATINGS = ['failed', 'hard', 'good', 'perfect'] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

// ---------------------------------------------------------------------------
// Domain entities
// ---------------------------------------------------------------------------

export type LocalizedString = {
  fr: string;
  en: string;
  ar?: string;
};

export type Root = {
  _id: string;
  letters: string; // e.g. "ك-ت-ب"
  lettersArray: string[];
  transliteration: string;
  coreMeaning: LocalizedString;
  semanticField: SemanticField;
  frequency: number;
  difficulty: Difficulty;
  isEssential: boolean;
  isQuranic: boolean;
  wordsCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type WordExample = {
  arabic: string;
  translations: LocalizedString;
};

export type Word = {
  _id: string;
  arabicWord: string; // vocalised
  arabicWordUnvocalized: string;
  transliteration: string; // DIN
  transliterationSimplified: string; // ASCII
  translations: LocalizedString;
  root: string | Root;
  pattern?: string; // wazn
  grammaticalCategory: GrammaticalCategory;
  examples?: WordExample[];
  createdAt?: string;
  updatedAt?: string;
};

export type Progress = {
  _id: string;
  user: string;
  root: string | Root;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  wordsLearned: string[];
  reviewCount: number;
  successCount: number;
  nextReviewDate: string;
  intervalDays: number;
  easinessFactor: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Note = {
  _id: string;
  user: string;
  targetType: 'Root' | 'Word';
  target: string;
  content: string;
  type: NoteType;
  isPublic: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type Collection = {
  _id: string;
  user: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  roots: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
};

// ---------------------------------------------------------------------------
// API response envelopes
// ---------------------------------------------------------------------------

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: Pagination;
};

// ---------------------------------------------------------------------------
// Constellation graph payload
// ---------------------------------------------------------------------------

export type ConstellationNode = {
  id: string;
  letters: string;
  semanticField: SemanticField;
  masteryLevel?: number;
  wordsCount: number;
};

export type ConstellationLink = {
  source: string;
  target: string;
  weight: number;
};

export type ConstellationGraph = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  meta?: {
    generatedAt: string;
  };
};

// ---------------------------------------------------------------------------
// Stats / dashboard
// ---------------------------------------------------------------------------

export type WeeklyActivityPoint = {
  date: string; // ISO yyyy-mm-dd
  count: number;
};

export type ProgressStats = {
  totalRootsLearned: number;
  totalWordsMastered: number;
  streak: number;
  activeDays: number;
  weeklyActivity: WeeklyActivityPoint[];
};

export type TodayReview = {
  rootsToReview: Array<{
    root: Root;
    progress: Progress;
  }>;
};
