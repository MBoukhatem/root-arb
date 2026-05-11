import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, AlertCircle } from 'lucide-react';
import { useTodayReview, useRecordReview } from '@/features/progress/hooks/useProgress';
import { ArabicText } from '@/shared/ui/ArabicText';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { SemanticFieldBadge } from '@/shared/ui/SemanticFieldBadge';
import type { ReviewRating } from '@/types/models';

type RatingConfig = {
  rating: ReviewRating;
  labelKey: string;
  className: string;
};

/**
 * Per agent_04 R3 §1.10: NO `#e23923` here. The "failed" button uses an amber
 * tone (orange-700) rather than the destructive red.
 */
const RATINGS: RatingConfig[] = [
  {
    rating: 'failed',
    labelKey: 'learn:rating.failed',
    className: 'bg-orange-700 hover:bg-orange-800 text-white',
  },
  {
    rating: 'hard',
    labelKey: 'learn:rating.hard',
    className: 'bg-(--warning) hover:opacity-90 text-white',
  },
  {
    rating: 'good',
    labelKey: 'learn:rating.good',
    className: 'bg-(--success) hover:opacity-90 text-white',
  },
  {
    rating: 'perfect',
    labelKey: 'learn:rating.perfect',
    className: 'bg-(--gold) hover:opacity-90 text-white',
  },
];

export default function LearnPage() {
  const { t } = useTranslation(['learn', 'common', 'nav']);
  const review = useTodayReview();
  const recordReview = useRecordReview();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const items = review.data?.rootsToReview ?? [];
  const current = items[index];

  useEffect(() => {
    if (completed) {
      void confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [completed]);

  if (review.isPending) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Skeleton variant="card" className="h-72" />
      </section>
    );
  }
  if (review.isError) {
    return (
      <section className="mx-auto w-full max-w-3xl">
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => void review.refetch()}>{t('common:retry')}</Button>}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl">
        <EmptyState
          icon={<Award size={32} aria-hidden />}
          title={t('learn:allCaughtUpTitle')}
          description={t('learn:allCaughtUpDescription')}
          action={
            <Link to="/explore">
              <Button>{t('nav:explore')}</Button>
            </Link>
          }
        />
      </section>
    );
  }

  if (completed || !current) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-10 text-center">
        <Award size={48} className="text-(--gold)" aria-hidden />
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('learn:sessionDoneTitle')}</h1>
        <p className="text-(--text-muted)">{t('learn:sessionDoneSubtitle')}</p>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button variant="secondary">{t('nav:dashboard')}</Button>
          </Link>
          <Button
            icon={<RotateCcw size={16} aria-hidden />}
            onClick={() => {
              setIndex(0);
              setCompleted(false);
              setFlipped(false);
              void review.refetch();
            }}
          >
            {t('learn:reviewAgain')}
          </Button>
        </div>
      </section>
    );
  }

  function handleRate(rating: ReviewRating) {
    if (!current) return;
    recordReview.mutate({ rootId: current.root._id, rating });
    setFlipped(false);
    if (index + 1 >= items.length) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--text-primary)">{t('learn:sessionTitle')}</h1>
        <span className="text-sm text-(--text-muted)">
          {t('learn:progressOf', { current: index + 1, total: items.length })}
        </span>
      </header>

      <div className="h-2 w-full overflow-hidden rounded-full bg-(--bg-card)">
        <div
          className="h-full bg-(--cat-verb-fill) transition-all"
          style={{ width: `${((index + (flipped ? 0.5 : 0)) / items.length) * 100}%` }}
          aria-hidden
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={current.root._id + (flipped ? '-back' : '-front')}
          type="button"
          onClick={() => setFlipped((f) => !f)}
          initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-(--border) bg-(--bg-card) p-8 text-center"
          aria-label={flipped ? t('learn:hideAnswer') : t('learn:revealAnswer')}
        >
          {!flipped ? (
            <>
              <ArabicText
                as="title"
                unvocalized={current.root.letters}
                className="text-[clamp(56px,8vw,80px)]"
              >
                {current.root.letters}
              </ArabicText>
              <p className="font-mono text-(--text-muted)">{current.root.transliteration}</p>
              <span className="text-sm text-(--text-muted)">{t('learn:tapToReveal')}</span>
            </>
          ) : (
            <>
              <p className="text-2xl text-(--text-primary)">{current.root.coreMeaning.fr}</p>
              <p className="text-base text-(--text-muted)">{current.root.coreMeaning.en}</p>
              <SemanticFieldBadge field={current.root.semanticField} />
            </>
          )}
        </motion.button>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RATINGS.map((r) => (
          <button
            key={r.rating}
            type="button"
            disabled={!flipped || recordReview.isPending}
            onClick={() => handleRate(r.rating)}
            className={`rounded-lg px-3 py-3 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${r.className}`}
          >
            {t(r.labelKey)}
          </button>
        ))}
      </div>
      {!flipped ? (
        <p className="text-center text-xs text-(--text-muted)">{t('learn:revealHint')}</p>
      ) : null}
    </section>
  );
}
