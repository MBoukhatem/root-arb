import clsx from 'clsx';
import { ArabicText } from './ArabicText';
import type { Word } from '@/types/models';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type WordCardProps = {
  word: Word;
  className?: string;
};

export function WordCard({ word, className }: WordCardProps) {
  const { lang } = useLanguage();
  const translation =
    lang === 'en'
      ? word.translations.en
      : lang === 'ar'
        ? (word.translations.ar ?? word.translations.fr)
        : word.translations.fr;

  return (
    <article
      className={clsx(
        'flex flex-col gap-2 rounded-lg border border-(--border) bg-(--bg-card) p-4',
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-2">
        <ArabicText as="inline" unvocalized={word.arabicWordUnvocalized} className="text-[28px]">
          {word.arabicWord}
        </ArabicText>
        {word.pattern ? (
          <ArabicText as="inline" className="text-(--text-muted) text-base">
            {word.pattern}
          </ArabicText>
        ) : null}
      </header>
      <span className="font-mono text-xs text-(--text-muted)">{word.transliteration}</span>
      <p className="text-sm text-(--text-primary)">{translation}</p>
    </article>
  );
}
