import { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, BookOpen, Check, FolderPlus, Layers, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoot } from './hooks/useRoots';
import { ArabicText } from '@/shared/ui/ArabicText';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { WordCard } from '@/shared/ui/WordCard';
import { SemanticFieldBadge } from '@/shared/ui/SemanticFieldBadge';
import { useAuth } from '@/features/auth/useAuth';
import { useRecordReview } from '@/features/progress/hooks/useProgress';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { RootTree, type RootTreeWord, type GrammaticalCategory as VizCategory } from '@/shared/viz';
import { GRAMMATICAL_CATEGORIES, type GrammaticalCategory, type Word } from '@/types/models';

/**
 * Maps the PLAN-FINAL grammatical-category enum to the viz-internal enum used
 * by the D3 RootTree component (which was authored against a slightly older
 * brief). Categories that have no 1:1 visual mapping fall back to `noun`.
 */
/**
 * Maps grammatical-category values returned by the seed to the viz-internal
 * enum used by the D3 RootTree. The seed (server/src/seeds/data/words.json)
 * mixes PLAN-FINAL aliases (`masdar`, `derive`, `pluriel-brise`) with the
 * older viz names (`verbal_noun`, `agent`, `place`, `instrument`). We cover
 * both spellings here and fall back to `noun` for any new value.
 */
const VIZ_CATEGORY_MAP: Record<string, VizCategory> = {
  verb: 'verb',
  noun: 'noun',
  adjective: 'adjective',
  adverb: 'noun',
  participle: 'participle',
  // PLAN-FINAL aliases
  masdar: 'verbal_noun',
  'pluriel-brise': 'noun',
  derive: 'noun',
  // Seed-direct viz names (server-emitted values)
  verbal_noun: 'verbal_noun',
  agent: 'agent',
  place: 'place',
  instrument: 'instrument',
};

function toRootTreeWord(w: Word): RootTreeWord {
  return {
    _id: w._id,
    arabicWord: w.arabicWord,
    transliteration: w.transliteration,
    translations: w.translations,
    grammaticalCategory: VIZ_CATEGORY_MAP[w.grammaticalCategory] ?? 'noun',
  };
}

export default function RootDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['roots', 'common']);
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { data, isPending, isError, error, refetch } = useRoot(id);
  const recordReview = useRecordReview();
  const [activeCategory, setActiveCategory] = useState<GrammaticalCategory | 'all'>('all');

  const byCategory = useMemo(() => {
    const map = new Map<GrammaticalCategory, Word[]>();
    if (!data) return map;
    for (const w of data.words) {
      const arr = map.get(w.grammaticalCategory) ?? [];
      arr.push(w);
      map.set(w.grammaticalCategory, arr);
    }
    return map;
  }, [data]);

  // Guard: no id in URL params → redirect to explore (hooks done above).
  if (!id) return <Navigate to="/explore" replace />;

  if (isPending) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="tree" />
      </section>
    );
  }

  if (isError || !data) {
    const is404 = (error as { response?: { status?: number } } | null)?.response?.status === 404;
    return (
      <section className="mx-auto flex w-full max-w-3xl p-6">
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={is404 ? t('roots:rootNotFound') : t('common:error')}
          action={
            is404 ? (
              <Link to="/explore">
                <Button variant="primary">{t('roots:backToExplore')}</Button>
              </Link>
            ) : (
              <Button onClick={() => void refetch()}>{t('common:retry')}</Button>
            )
          }
        />
      </section>
    );
  }

  const root = data.root;
  const meaning =
    lang === 'en'
      ? root.coreMeaning.en
      : lang === 'ar'
        ? (root.coreMeaning.ar ?? root.coreMeaning.fr)
        : root.coreMeaning.fr;

  const filteredWords =
    activeCategory === 'all' ? data.words : (byCategory.get(activeCategory) ?? []);

  function markLearned() {
    recordReview.mutate(
      { rootId: root._id, rating: 'good' },
      {
        onSuccess: () => toast.success(t('roots:markedAsLearned')),
        onError: () => toast.error(t('common:error')),
      },
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6">
      <div className="flex items-center gap-2 text-sm text-(--text-muted)">
        <Link to="/explore" className="hover:text-(--text-primary)">
          {t('roots:backToExplore')}
        </Link>
      </div>

      <header className="flex flex-col items-center gap-4 rounded-2xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <ArabicText as="title" unvocalized={root.letters} className="text-[clamp(64px,9vw,96px)]">
          {root.letters}
        </ArabicText>
        <p className="font-mono text-lg text-(--text-muted)">{root.transliteration}</p>
        <p className="text-xl text-(--text-primary)">{meaning}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SemanticFieldBadge field={root.semanticField} />
          {root.isEssential ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-(--gold)/15 px-2.5 py-0.5 text-xs font-medium text-(--gold)">
              <Star size={12} aria-hidden />
              {t('roots:isEssential')}
            </span>
          ) : null}
          {root.isQuranic ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-(--cat-derive-fill)/15 px-2.5 py-0.5 text-xs font-medium text-(--cat-derive-ink)">
              <Sparkles size={12} aria-hidden />
              {t('roots:isQuranic')}
            </span>
          ) : null}
        </div>
        {user ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              icon={<Check size={16} aria-hidden />}
              loading={recordReview.isPending}
              onClick={markLearned}
            >
              {t('roots:markAsLearned')}
            </Button>
            <Button variant="secondary" icon={<FolderPlus size={16} aria-hidden />}>
              {t('roots:addToCollection')}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-(--text-muted)">
            <Link to="/login" className="underline">
              {t('roots:signInToLearn')}
            </Link>
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          icon={<BookOpen size={18} aria-hidden />}
          label={t('roots:wordsLabel')}
          value={String(root.wordsCount)}
        />
        <StatTile
          icon={<Layers size={18} aria-hidden />}
          label={t('roots:difficulty')}
          value={t(`roots:difficultyLevels.${root.difficulty}`)}
        />
        <StatTile
          icon={<Sparkles size={18} aria-hidden />}
          label={t('roots:frequency')}
          value={String(root.frequency)}
        />
        <StatTile
          icon={<Star size={18} aria-hidden />}
          label={t('roots:isEssential')}
          value={root.isEssential ? t('common:yes') : t('common:no')}
        />
      </div>

      <div
        className="root-tree-slot rounded-2xl border border-(--border) bg-(--bg-card) p-4"
        data-root-id={root._id}
      >
        <RootTree
          root={{
            letters: root.letters,
            transliteration: root.transliteration,
            coreMeaning: root.coreMeaning,
          }}
          words={data.words.map(toRootTreeWord)}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-(--text-primary)">{t('roots:derivedWords')}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            aria-pressed={activeCategory === 'all'}
            className={tabClass(activeCategory === 'all')}
          >
            {t('roots:allCategories')} ({data.words.length})
          </button>
          {GRAMMATICAL_CATEGORIES.map((c) => {
            const count = byCategory.get(c)?.length ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                aria-pressed={activeCategory === c}
                className={tabClass(activeCategory === c)}
              >
                {t(`roots:category.${c}`)} ({count})
              </button>
            );
          })}
        </div>
        {filteredWords.length === 0 ? (
          <EmptyState title={t('roots:noWords')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredWords.map((w) => (
              <WordCard key={w._id} word={w} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function tabClass(active: boolean): string {
  return active
    ? 'rounded-full bg-(--cat-verb-fill) px-3 py-1.5 text-sm font-medium text-white'
    : 'rounded-full border border-(--border) bg-(--bg-card) px-3 py-1.5 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary)';
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-(--border) bg-(--bg-card) p-4">
      <span className="inline-flex items-center gap-1 text-xs text-(--text-muted)">
        {icon}
        {label}
      </span>
      <span className="text-lg font-semibold text-(--text-primary)">{value}</span>
    </div>
  );
}
