import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BookOpen, Star } from 'lucide-react';
import { ArabicText } from './ArabicText';
import { SemanticFieldBadge } from './SemanticFieldBadge';
import type { Root } from '@/types/models';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type RootCardProps = {
  root: Root;
  masteryLevel?: number;
  className?: string;
};

/**
 * Card displayed in /explore. Arabic letters dominate visually (clamp 40-56px)
 * with translit + translation as supporting metadata. Logical properties only.
 */
export function RootCard({ root, masteryLevel, className }: RootCardProps) {
  const { t } = useTranslation(['roots']);
  const { lang } = useLanguage();
  const meaning =
    lang === 'en'
      ? root.coreMeaning.en
      : lang === 'ar'
        ? (root.coreMeaning.ar ?? root.coreMeaning.fr)
        : root.coreMeaning.fr;

  return (
    <Link
      to={`/roots/${encodeURIComponent(root._id)}`}
      className={clsx(
        'group flex flex-col gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-5 transition-shadow hover:shadow-md focus-visible:shadow-md',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <ArabicText as="title" unvocalized={root.letters} className="text-[clamp(40px,5vw,56px)]">
          {root.letters}
        </ArabicText>
        <div className="flex flex-col items-end gap-1">
          {root.isEssential ? (
            <Star size={14} className="text-(--gold)" aria-label={t('roots:isEssential')} />
          ) : null}
          {masteryLevel != null ? (
            <span className="rounded-full bg-(--cat-noun-fill)/15 px-2 py-0.5 text-xs font-medium text-(--cat-noun-ink)">
              {t('roots:mastery', { level: masteryLevel })}
            </span>
          ) : null}
        </div>
      </header>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-sm text-(--text-muted)">{root.transliteration}</span>
        <span className="text-base text-(--text-primary)">{meaning}</span>
      </div>
      <footer className="mt-auto flex items-center justify-between gap-2">
        <SemanticFieldBadge field={root.semanticField} />
        <span className="inline-flex items-center gap-1 text-xs text-(--text-muted)">
          <BookOpen size={12} aria-hidden />
          {t('roots:wordsCount', { count: root.wordsCount })}
        </span>
      </footer>
    </Link>
  );
}
