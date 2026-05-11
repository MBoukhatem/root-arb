export type GrammaticalCategory =
  | 'verb'
  | 'noun'
  | 'adjective'
  | 'place'
  | 'agent'
  | 'instrument'
  | 'verbal_noun'
  | 'participle';

export type RootTreeWord = {
  _id: string;
  arabicWord: string;
  transliteration: string;
  translations: { fr: string; en: string; ar?: string };
  grammaticalCategory: GrammaticalCategory;
};

export type RootTreeRoot = {
  letters: string;
  transliteration: string;
  coreMeaning: { fr: string; en: string; ar?: string };
};

export type RootTreeProps = {
  root: RootTreeRoot;
  words: RootTreeWord[];
  onWordClick?: (wordId: string) => void;
  className?: string;
};

/** Internal hierarchy datum produced from props to feed d3.hierarchy. */
export type RootTreeDatum = {
  id: string;
  label: string;
  transliteration: string;
  translation: string;
  category: GrammaticalCategory | 'root';
  /** Original word _id (undefined for the root itself). */
  wordId?: string;
  children?: RootTreeDatum[];
};
