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
export function interpolateFill(normFreq: number, isDark: boolean): string {
  if (isDark) {
    // dark: lch(0.38→0.62) — floor raised for ring-2 legibility
    const l = 0.38 + normFreq * 0.24; // 0.38 → 0.62
    const c = 0.06 + normFreq * 0.05; // 0.06 → 0.11
    return `oklch(${l.toFixed(2)} ${c.toFixed(2)} 250)`;
  }
  // light: lch(0.70→0.92) — high-freq nodes are darker/more saturated
  const l = 0.7 + (1 - normFreq) * 0.22; // 0.70 → 0.92
  const c = 0.02 + normFreq * 0.06; // 0.02 → 0.08
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} 250)`;
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
