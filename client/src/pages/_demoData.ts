import type { RootTreeProps } from '@/shared/viz';

/**
 * Hardcoded showcase data for the LandingPage demo: the canonical root ك-ت-ب
 * with seven derived forms covering verb, agent, place, instrument, verbal
 * noun, participle, and a derived noun. Used to deliver the "wow moment"
 * before login.
 */
export const DEMO_ROOT_KTB: RootTreeProps = {
  root: {
    letters: 'ك ت ب',
    transliteration: 'k-t-b',
    coreMeaning: {
      fr: 'écrire',
      en: 'to write',
      ar: 'كتابة',
    },
  },
  words: [
    {
      _id: 'kataba',
      arabicWord: 'كَتَبَ',
      transliteration: 'kataba',
      translations: { fr: 'il a écrit', en: 'he wrote', ar: 'كتب' },
      grammaticalCategory: 'verb',
    },
    {
      _id: 'kitaab',
      arabicWord: 'كِتَاب',
      transliteration: 'kitāb',
      translations: { fr: 'livre', en: 'book', ar: 'كتاب' },
      grammaticalCategory: 'noun',
    },
    {
      _id: 'kaatib',
      arabicWord: 'كَاتِب',
      transliteration: 'kātib',
      translations: { fr: 'écrivain', en: 'writer', ar: 'كاتب' },
      grammaticalCategory: 'agent',
    },
    {
      _id: 'maktab',
      arabicWord: 'مَكْتَب',
      transliteration: 'maktab',
      translations: { fr: 'bureau', en: 'office', ar: 'مكتب' },
      grammaticalCategory: 'place',
    },
    {
      _id: 'maktaba',
      arabicWord: 'مَكْتَبَة',
      transliteration: 'maktaba',
      translations: { fr: 'bibliothèque', en: 'library', ar: 'مكتبة' },
      grammaticalCategory: 'place',
    },
    {
      _id: 'kitaaba',
      arabicWord: 'كِتَابَة',
      transliteration: 'kitāba',
      translations: { fr: 'écriture', en: 'writing', ar: 'كتابة' },
      grammaticalCategory: 'verbal_noun',
    },
    {
      _id: 'maktub',
      arabicWord: 'مَكْتُوب',
      transliteration: 'maktūb',
      translations: { fr: 'écrit', en: 'written', ar: 'مكتوب' },
      grammaticalCategory: 'participle',
    },
    {
      _id: 'miktaab',
      arabicWord: 'مِكْتَاب',
      transliteration: 'miktāb',
      translations: { fr: 'machine à écrire', en: 'typewriter', ar: 'مكتاب' },
      grammaticalCategory: 'instrument',
    },
  ],
};
