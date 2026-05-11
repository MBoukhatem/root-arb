import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { env, SUPPORTED_LANGS } from '@/shared/lib/env';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

/**
 * i18next initialisation.
 *
 * Per agent_08 R3:
 * - Namespaces: common, nav, auth, errors (more added per feature later).
 * - Priority: user.preferredInterfaceLanguage > localStorage > navigator > fr.
 * - AR plurals via Intl.PluralRules ('v4' compatibility JSON).
 *
 * Scaffold simplification: all 4 namespaces are bundled inline (no http-backend
 * yet); lazy-load by route will be wired in S2 when locale files grow.
 */

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    lng: env.DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    ns: ['common', 'nav', 'auth', 'errors'],
    defaultNS: 'common',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'art_lang',
    },
    resources: {
      fr: { ...fr },
      en: { ...en },
      ar: { ...ar },
    },
  });

export default i18n;
