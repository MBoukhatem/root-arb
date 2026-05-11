import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Award, BookOpen, CalendarCheck, Flame, GraduationCap } from 'lucide-react';
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

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t('dashboard:welcome', { name: user?.username ?? '' })}
        </h1>
        <p className="text-(--text-muted)">{t('dashboard:welcomeSubtitle')}</p>
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
      ) : stats.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen size={18} aria-hidden />}
            label={t('dashboard:rootsLearned')}
            value={stats.data.totalRootsLearned}
            tone="verb"
          />
          <StatCard
            icon={<Award size={18} aria-hidden />}
            label={t('dashboard:wordsMastered')}
            value={stats.data.totalWordsMastered}
            tone="noun"
          />
          <StatCard
            icon={<Flame size={18} aria-hidden />}
            label={t('dashboard:streak')}
            value={stats.data.streak}
            suffix={t('dashboard:daysSuffix')}
            tone="adjective"
          />
          <StatCard
            icon={<CalendarCheck size={18} aria-hidden />}
            label={t('dashboard:activeDays')}
            value={stats.data.activeDays}
            tone="masdar"
          />
        </div>
      ) : null}

      {stats.data ? (
        <section className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
            {t('dashboard:weeklyActivity')}
          </h2>
          <WeeklyBars data={stats.data.weeklyActivity} />
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
        ) : today.data && today.data.rootsToReview.length === 0 ? (
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
            {today.data?.rootsToReview.map(({ root }) => (
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

function WeeklyBars({ data }: { data: { date: string; count: number }[] }) {
  const max = data.reduce((m, p) => Math.max(m, p.count), 0) || 1;
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((p) => {
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
