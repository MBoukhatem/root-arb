import { useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Reads CSS variables from `:root` so D3 / Recharts can colour graphs with the
 * same tokens as Tailwind classes. Re-evaluates when the theme changes (via
 * useTheme) so dark<->light transitions update graphs.
 *
 * Per agent_02 R3: also observes <html class> via MutationObserver - we get
 * this for free here because useTheme already re-renders on .dark add/remove.
 */
const TOKEN_KEYS = [
  '--bg-base',
  '--bg-card',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--border',
  '--focus-ring',
  '--cat-verb-fill',
  '--cat-noun-fill',
  '--cat-adjective-fill',
  '--cat-adverb-fill',
  '--cat-participle-fill',
  '--cat-masdar-fill',
  '--cat-pluriel-brise-fill',
  '--cat-derive-fill',
  '--success',
  '--warning',
  '--danger',
  '--info',
  '--gold',
] as const;

type TokenKey = (typeof TOKEN_KEYS)[number];
type DesignTokens = Record<TokenKey, string>;

function readTokens(): DesignTokens {
  if (typeof window === 'undefined') {
    return Object.fromEntries(TOKEN_KEYS.map((k) => [k, ''])) as DesignTokens;
  }
  const styles = getComputedStyle(document.documentElement);
  const result = {} as DesignTokens;
  for (const key of TOKEN_KEYS) {
    result[key] = styles.getPropertyValue(key).trim();
  }
  return result;
}

export function useDesignTokens(): DesignTokens {
  const { resolved } = useTheme();
  // Re-read CSS vars on every theme change. useMemo re-runs synchronously after
  // ThemeContext has applied the .dark class, so the values are always current.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readTokens(), [resolved]);
}
