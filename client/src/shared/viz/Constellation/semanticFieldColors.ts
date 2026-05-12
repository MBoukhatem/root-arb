/**
 * Stable mapping `semanticField -> color` for the constellation graph.
 *
 * Named fields resolve to CSS variable tokens (--sf-*) defined in tokens.css so
 * colours stay theme-aware (light / dark) and are shared with RootTree / ConcentricLetters.
 *
 * Fallback for unknown fields uses a hashed index into the categorical fill palette
 * so the colour is deterministic across renders even without an a priori catalogue.
 */

/** Resolve a CSS variable at runtime via getComputedStyle. Caches per var name. */
const _cssVarCache = new Map<string, string>();
function resolveCSSVar(varName: string): string {
  if (_cssVarCache.has(varName)) return _cssVarCache.get(varName)!;
  if (typeof document === 'undefined') return '#6366f1';
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (val) _cssVarCache.set(varName, val);
  return val || '#6366f1';
}

/** Clear the cache on theme toggle so dark-mode values are re-read. */
export function invalidateSemanticFieldCache(): void {
  _cssVarCache.clear();
}

/**
 * Named semantic fields mapped to design tokens. Covers both FR and EN keys.
 * Token names mirror the --sf-* variables in tokens.css.
 */
const EXPLICIT_VAR: Record<string, string> = {
  écriture: '--sf-writing',
  writing: '--sf-writing',
  lecture: '--sf-reading',
  reading: '--sf-reading',
  parole: '--sf-speech',
  speech: '--sf-speech',
  mouvement: '--sf-motion',
  motion: '--sf-motion',
  pensée: '--sf-thought',
  thought: '--sf-thought',
  émotion: '--sf-emotion',
  emotion: '--sf-emotion',
  action: '--sf-action',
  derive: '--sf-derive',
  dérivé: '--sf-derive',
};

/** Fallback palette — mirrors --cat-*-fill token order for cross-viz harmony. */
const FALLBACK_VARS = [
  '--cat-verb-fill',
  '--cat-noun-fill',
  '--cat-adjective-fill',
  '--cat-participle-fill',
  '--cat-masdar-fill',
  '--cat-pluriel-brise-fill',
  '--cat-adverb-fill',
  '--cat-derive-fill',
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Returns the resolved CSS colour string for a semantic field.
 * Call `invalidateSemanticFieldCache()` after a theme toggle for accurate colours.
 */
export function colorForSemanticField(field: string): string {
  const norm = field.trim().toLowerCase();
  if (norm in EXPLICIT_VAR) return resolveCSSVar(EXPLICIT_VAR[norm]);
  const fallbackVar = FALLBACK_VARS[hashString(norm) % FALLBACK_VARS.length];
  return resolveCSSVar(fallbackVar);
}
