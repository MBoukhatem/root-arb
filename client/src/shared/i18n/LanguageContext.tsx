import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/shared/lib/env';

type Direction = 'ltr' | 'rtl';

type LanguageContextValue = {
  lang: SupportedLanguage;
  dir: Direction;
  isRTL: boolean;
  setLang: (lang: SupportedLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function dirFor(lang: SupportedLanguage): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const initial = (i18n.resolvedLanguage ?? i18n.language ?? 'fr') as SupportedLanguage;
  const [lang, setLangState] = useState<SupportedLanguage>(initial);

  // Sync <html lang dir> on every change. This is the single source of truth
  // for chrome direction; logical properties read it automatically.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dirFor(lang);
  }, [lang]);

  // Track i18next external changes (e.g. devtools, deep-link ?lng=ar).
  useEffect(() => {
    const onChange = (next: string) => {
      if (next === 'fr' || next === 'en' || next === 'ar') {
        setLangState(next);
      }
    };
    i18n.on('languageChanged', onChange);
    return () => {
      i18n.off('languageChanged', onChange);
    };
  }, [i18n]);

  const setLang = useCallback(
    (next: SupportedLanguage) => {
      void i18n.changeLanguage(next);
      setLangState(next);
    },
    [i18n],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: dirFor(lang),
      isRTL: lang === 'ar',
      setLang,
    }),
    [lang, setLang],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = use(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within <LanguageProvider>');
  }
  return ctx;
}
