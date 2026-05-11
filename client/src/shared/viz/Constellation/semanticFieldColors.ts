/**
 * Stable mapping `semanticField -> color` for the constellation graph. Falls
 * back to a hashed palette index for fields not explicitly listed so the colour
 * is deterministic across renders even without an a priori catalogue.
 */
const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ea580c', // orange
  '#6366f1', // indigo
  '#16a34a', // green
  '#dc2626', // red
] as const;

const EXPLICIT: Record<string, string> = {
  écriture: PALETTE[0],
  writing: PALETTE[0],
  lecture: PALETTE[1],
  reading: PALETTE[1],
  parole: PALETTE[2],
  speech: PALETTE[2],
  mouvement: PALETTE[3],
  motion: PALETTE[3],
  pensée: PALETTE[4],
  thought: PALETTE[4],
  émotion: PALETTE[5],
  emotion: PALETTE[5],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function colorForSemanticField(field: string): string {
  const norm = field.trim().toLowerCase();
  if (norm in EXPLICIT) return EXPLICIT[norm];
  return PALETTE[hashString(norm) % PALETTE.length];
}
