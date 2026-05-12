import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarCheck,
  Flame,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useProgressStats, useTodayReview } from '@/features/progress/hooks/useProgress';
import { StatCard } from '@/shared/ui/StatCard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { ArabicText } from '@/shared/ui/ArabicText';

export default function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common', 'nav']);
  const { user } = useAuth();
  const stats = useProgressStats();
  const today = useTodayReview();

  // #2/#3 null-safe destructuring from server response
  const totalRootsLearned = stats.data?.totalRootsLearned ?? 0;
  const totalWordsMastered = stats.data?.totalWordsMastered ?? 0;
  const streak = stats.data?.streak ?? 0;
  const activeDays = stats.data?.activeDays ?? 0;
  const weeklyActivity = stats.data?.weeklyActivity ?? [];
  const levels = stats.data?.levels ?? {};

  // #8 Global empty state for new users
  const todayItems = today.data?.rootsToReview ?? [];
  const isNewUser =
    !stats.isPending && !today.isPending && totalRootsLearned === 0 && todayItems.length === 0;

  if (isNewUser) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <EmptyState
          icon={<BookOpen size={48} aria-hidden />}
          title={t('dashboard:emptyTitle')}
          description={t('dashboard:emptyDescription')}
          action={
            <Link to="/explore">
              <Button>{t('dashboard:startStudying')}</Button>
            </Link>
          }
          className="py-24"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex items-center justify-between gap-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-(--text-primary)">
            {t('dashboard:welcome', { name: user?.username ?? '' })}
          </h1>
          <p className="text-(--text-muted)">{t('dashboard:welcomeSubtitle')}</p>
        </div>
        {/* #9 Manual refresh button */}
        <button
          type="button"
          onClick={() => {
            void stats.refetch();
            void today.refetch();
          }}
          className="rounded-lg border border-(--border) bg-(--bg-card) p-2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
          title={t('common:refresh')}
          aria-label={t('common:refresh')}
        >
          <RefreshCw size={16} aria-hidden />
        </button>
      </header>

      {stats.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : stats.isError ? (
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => void stats.refetch()}>{t('common:retry')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* #5 streak uses stats.streak with animation from StatCard */}
          <StatCard
            icon={<BookOpen size={18} aria-hidden />}
            label={t('dashboard:rootsLearned')}
            value={totalRootsLearned}
            tone="verb"
          />
          <StatCard
            icon={<Award size={18} aria-hidden />}
            label={t('dashboard:wordsMastered')}
            value={totalWordsMastered}
            tone="noun"
          />
          <StatCard
            icon={<Flame size={18} aria-hidden />}
            label={t('dashboard:streak')}
            value={streak}
            suffix={t('dashboard:daysSuffix')}
            tone="adjective"
          />
          <StatCard
            icon={<CalendarCheck size={18} aria-hidden />}
            label={t('dashboard:activeDays')}
            value={activeDays}
            tone="masdar"
          />
        </div>
      )}

      {/* #2/#3 WeeklyBars null-safe */}
      {!stats.isPending && !stats.isError ? (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
            {t('dashboard:weeklyActivity')}
          </h2>
          <WeeklyBars data={weeklyActivity} />
        </section>
      ) : null}

      {/* #6 Mastery distribution */}
      {!stats.isPending && !stats.isError && Object.keys(levels).length > 0 ? (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
            {t('dashboard:masteryDistribution')}
          </h2>
          <MasteryBars levels={levels} />
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-(--text-primary)">{t('dashboard:today')}</h2>
          <Link to="/learn">
            <Button icon={<GraduationCap size={16} aria-hidden />}>
              {t('dashboard:startSession')}
            </Button>
          </Link>
        </header>
        {today.isPending ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : today.isError ? (
          <EmptyState
            icon={<AlertCircle size={32} aria-hidden />}
            title={t('common:error')}
            action={<Button onClick={() => void today.refetch()}>{t('common:retry')}</Button>}
          />
        ) : todayItems.length === 0 ? (
          <EmptyState
            icon={<Award size={32} aria-hidden />}
            title={t('dashboard:allCaughtUpTitle')}
            description={t('dashboard:allCaughtUpDescription')}
            action={
              <Link to="/explore">
                <Button variant="secondary">{t('nav:explore')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {todayItems.map(({ root }) => (
              <Link
                key={root._id}
                to={`/roots/${encodeURIComponent(root._id)}`}
                className="flex items-center gap-4 rounded-lg border border-(--border) bg-(--bg-card) p-4 hover:shadow-md"
              >
                <ArabicText as="title" unvocalized={root.letters} className="text-3xl">
                  {root.letters}
                </ArabicText>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-(--text-muted)">
                    {root.transliteration}
                  </span>
                  <span className="text-sm text-(--text-primary)">{root.coreMeaning.fr}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

// #2/#3 WeeklyBars — null-safe, renders EmptyState if no data
function WeeklyBars({ data }: { data?: { date: string; count: number }[] }) {
  const safe = data ?? [];
  if (safe.length === 0) {
    return <p className="text-center text-sm text-(--text-muted)">—</p>;
  }
  const max = safe.reduce((m, p) => Math.max(m, p.count), 0) || 1;
  return (
    <div className="flex h-32 items-end gap-2">
      {safe.map((p) => {
        const height = Math.max(4, Math.round((p.count / max) * 100));
        return (
          <div
            key={p.date}
            className="flex flex-1 flex-col items-center gap-1"
            title={`${p.date}: ${p.count}`}
          >
            <div
              className="w-full rounded-t bg-(--cat-verb-fill)/70"
              style={{ height: `${height}%` }}
              aria-hidden
            />
            <span className="text-[10px] text-(--text-muted)">{p.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

// #6 Mastery distribution bars (levels 0-5) colored via CSS vars
const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-(--cat-derive-fill)/50',
  1: 'bg-(--cat-masdar-fill)/60',
  2: 'bg-(--cat-adjective-fill)/70',
  3: 'bg-(--cat-noun-fill)/80',
  4: 'bg-(--cat-verb-fill)/80',
  5: 'bg-(--cat-verb-fill)',
};

function MasteryBars({ levels }: { levels: Record<number, number> }) {
  const entries = [0, 1, 2, 3, 4, 5].map((lvl) => ({ lvl, count: levels[lvl] ?? 0 }));
  const max = Math.max(...entries.map((e) => e.count)) || 1;
  return (
    <div className="flex h-24 items-end gap-3">
      {entries.map(({ lvl, count }) => {
        const height = Math.max(4, Math.round((count / max) * 100));
        return (
          <div
            key={lvl}
            className="flex flex-1 flex-col items-center gap-1"
            title={`Niveau ${lvl}: ${count}`}
          >
            <div
              className={`w-full rounded-t transition-all ${LEVEL_COLORS[lvl] ?? ''}`}
              style={{ height: `${height}%` }}
              aria-hidden
            />
            <span className="text-[10px] text-(--text-muted)">{lvl}</span>
          </div>
        );
      })}
    </div>
  );
}
