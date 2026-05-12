/**
 * ConcentricLetters — shared types.
 * Matches the API contract from GET /api/letters/:letter/cooccurrences
 * and GET /api/letters (letter list).
 */

export type Cooccurrence = {
  letter: string;
  count: number;
  sharedRootIds: string[];
};

export type CooccurrenceData = {
  letter: string;
  totalRootsWithLetter: number;
  cooccurrences: Cooccurrence[];
  generatedAt: string;
};

export type LetterCount = {
  letter: string;
  count: number;
};

export type LettersListData = LetterCount[];

// ---- Layout types produced by useConcentricLayout ----

export type RingNode = {
  letter: string;
  count: number;
  sharedRootIds: string[];
  /** 0 = nearest centre, 1 = mid, 2 = far */
  ring: 0 | 1 | 2;
  x: number;
  y: number;
  /** node circle radius in px (log-scaled by count) */
  radius: number;
  /** normalised frequency [0,1] for colour interpolation */
  normFreq: number;
};

export type CenterNode = {
  letter: string;
  x: number;
  y: number;
};

export type LayoutLink = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  normFreq: number;
};

export type ConcentricLayout = {
  centerNode: CenterNode;
  ringNodes: RingNode[];
  links: LayoutLink[];
};

// ---- Component props ----

export interface ConcentricLettersProps {
  selectedLetter: string;
  data: CooccurrenceData | null;
  onLetterSelect: (letter: string) => void;
  width?: number;
  height?: number;
  showTooltip?: boolean;
  isLoading?: boolean;
  className?: string;
}
