/**
 * ConcentricLetters — colour helpers.
 *
 * Uses the existing CSS design-token palette from tokens.css (oklch/hex).
 * Ring colours live in CSS variables added here; fill intensities are
 * interpolated per-node based on normalised frequency.
 *
 * Ring token map (light mode / dark mode controlled by .dark class):
 *   ring 0 (closest) → strongest blue
 *   ring 1 (mid)     → medium blue
 *   ring 2 (far)     → faint blue
 *
 * These token strings are consumed by SVG fill/stroke attributes via
 * `style={{ fill: ringFillVar(ring) }}` — SVG inherits CSS vars from the
 * document root.
 */

export function ringFillVar(ring: 0 | 1 | 2): string {
  return `var(--letter-ring${ring + 1}-fill)`;
}

export function ringInkVar(): string {
  return 'var(--letter-ink)';
}

export const CENTER_STROKE = 'var(--gold)';
export const CENTER_FILL_LIGHT = 'oklch(0.97 0.06 250)';
export const CENTER_FILL_DARK = 'oklch(0.18 0.08 250)';

/**
 * Returns an interpolated OKLCH fill colour for a peripheral letter node
 * using the normalised frequency [0,1]. Avoids relying on d3-interpolate to
 * keep the bundle lean — pure linear blend between ring stops.
 *
 * Dark mode: luminosity floor raised to 0.38 (was 0.30) so ring-2 nodes on
 * the far edge remain distinguishable against --bg-base (#0a0a0f). Chroma
 * stays modest to avoid halation on OLED screens.
 *
 * For SVG use: inject via `fill` attribute only when CSS var fallback is
 * insufficient (e.g. when animating with Framer Motion style props).
 */
/**
 * Single flat fill colour for every peripheral letter (user request: no
 * frequency-based intensity gradation). `normFreq` is accepted for API
 * compatibility but ignored.
 */
export function interpolateFill(_normFreq: number, isDark: boolean): string {
  void _normFreq;
  return isDark
    ? 'oklch(0.56 0.10 250)' // dark mode: medium luminous blue
    : 'oklch(0.82 0.06 250)'; // light mode: soft parchment blue
}

/**
 * Link stroke opacity: proportional to normFreq, clamped 0.25-0.9.
 */
export function linkOpacity(normFreq: number): number {
  return 0.25 + normFreq * 0.65;
}

/**
 * Link stroke width: 1–4 px proportional to count.
 */
export function linkStrokeWidth(normFreq: number): number {
  return 1 + normFreq * 3;
}
