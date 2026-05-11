/**
 * Environment variable validation (manual fail-fast).
 *
 * `import.meta.env` is typed via vite/client, but we validate at boot to fail
 * fast in dev when `.env` is missing. We deliberately avoid pulling Zod into
 * the bundle for a 2-key schema; manual parsing is sufficient here.
 */

type Lang = 'fr' | 'en' | 'ar';

const SUPPORTED_LANGS: readonly Lang[] = ['fr', 'en', 'ar'] as const;

function readString(key: string, fallback?: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`[env] Missing required variable: ${key}`);
  }
  return value;
}

function readLang(key: string, fallback: Lang): Lang {
  const raw = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!raw) return fallback;
  return (SUPPORTED_LANGS as readonly string[]).includes(raw) ? (raw as Lang) : fallback;
}

export const env = {
  API_URL: readString('VITE_API_URL', 'http://localhost:5000/api'),
  DEFAULT_LANGUAGE: readLang('VITE_DEFAULT_LANGUAGE', 'fr'),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export type Env = typeof env;
export type SupportedLanguage = Lang;
export { SUPPORTED_LANGS };
