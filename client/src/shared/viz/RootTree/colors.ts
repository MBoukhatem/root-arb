import type { GrammaticalCategory } from './RootTree.types';

/**
 * Maps a grammatical category to the CSS variable token used for both fill
 * (graph) and ink (text). The hook `useDesignTokens()` reads these vars from
 * `:root` so charts stay theme-synced.
 *
 * Categories not present in the design tokens fall back to the "derive"
 * (derived form) palette.
 */
const CATEGORY_TO_VAR: Record<GrammaticalCategory, { fill: string; ink: string }> = {
  verb: { fill: 'var(--cat-verb-fill)', ink: 'var(--cat-verb-ink)' },
  noun: { fill: 'var(--cat-noun-fill)', ink: 'var(--cat-noun-ink)' },
  adjective: { fill: 'var(--cat-adjective-fill)', ink: 'var(--cat-adjective-ink)' },
  participle: { fill: 'var(--cat-participle-fill)', ink: 'var(--cat-participle-ink)' },
  verbal_noun: { fill: 'var(--cat-masdar-fill)', ink: 'var(--cat-masdar-ink)' },
  place: { fill: 'var(--cat-pluriel-brise-fill)', ink: 'var(--cat-pluriel-brise-ink)' },
  agent: { fill: 'var(--cat-derive-fill)', ink: 'var(--cat-derive-ink)' },
  instrument: { fill: 'var(--cat-adverb-fill)', ink: 'var(--cat-adverb-ink)' },
};

export function categoryFill(cat: GrammaticalCategory): string {
  return CATEGORY_TO_VAR[cat].fill;
}

export function categoryInk(cat: GrammaticalCategory): string {
  return CATEGORY_TO_VAR[cat].ink;
}
