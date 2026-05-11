import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Search } from 'lucide-react';
import { useRoots } from './hooks/useRoots';
import { SearchBar } from '@/shared/ui/SearchBar';
import { FilterPill } from '@/shared/ui/FilterPill';
import { RootCard } from '@/shared/ui/RootCard';
import { Pagination } from '@/shared/ui/Pagination';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { SEMANTIC_FIELDS, type Difficulty, type SemanticField } from '@/types/models';

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const { t } = useTranslation(['roots', 'common']);
  const [search, setSearch] = useState('');
  const [semanticField, setSemanticField] = useState<SemanticField | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isEssential, setIsEssential] = useState<boolean | null>(null);
  const [isQuranic, setIsQuranic] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);

  const query = {
    page,
    limit: PAGE_SIZE,
    search,
    semanticField,
    difficulty,
    isEssential,
    isQuranic,
  };

  const { data, isPending, isError, refetch } = useRoots(query);

  function resetFilters() {
    setSemanticField(null);
    setDifficulty(null);
    setIsEssential(null);
    setIsQuranic(null);
    setPage(1);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('roots:exploreTitle')}</h1>
        <p className="text-(--text-muted)">{t('roots:exploreSubtitle')}</p>
      </header>

      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
          placeholder={t('roots:searchPlaceholder')}
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-(--text-secondary)">
            {t('roots:filterBySemanticField')}
          </span>
          <div className="flex flex-wrap gap-2">
            {SEMANTIC_FIELDS.map((field) => (
              <FilterPill
                key={field}
                active={semanticField === field}
                onClick={() => {
                  setSemanticField(semanticField === field ? null : field);
                  setPage(1);
                }}
              >
                {t(`roots:semanticField.${field}`)}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-(--text-secondary)">
            {t('roots:difficulty')}
          </span>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <FilterPill
              key={d}
              active={difficulty === d}
              onClick={() => {
                setDifficulty(difficulty === d ? null : d);
                setPage(1);
              }}
            >
              {t(`roots:difficultyLevels.${d}`)}
            </FilterPill>
          ))}
          <FilterPill
            active={isEssential === true}
            onClick={() => {
              setIsEssential(isEssential === true ? null : true);
              setPage(1);
            }}
          >
            {t('roots:isEssential')}
          </FilterPill>
          <FilterPill
            active={isQuranic === true}
            onClick={() => {
              setIsQuranic(isQuranic === true ? null : true);
              setPage(1);
            }}
          >
            {t('roots:isQuranic')}
          </FilterPill>
          {(semanticField || difficulty || isEssential || isQuranic) && (
            <button
              type="button"
              onClick={resetFilters}
              className="ms-auto text-sm text-(--text-muted) underline hover:text-(--text-primary)"
            >
              {t('roots:resetFilters')}
            </button>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => void refetch()}>{t('common:retry')}</Button>}
        />
      ) : data && data.roots.length === 0 ? (
        <EmptyState
          icon={<Search size={32} aria-hidden />}
          title={t('roots:emptyTitle')}
          description={t('roots:emptyDescription')}
          action={<Button onClick={resetFilters}>{t('roots:resetFilters')}</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.roots.map((r) => (
              <RootCard key={r._id} root={r} />
            ))}
          </div>
          {data ? (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              className="pt-4"
            />
          ) : null}
        </>
      )}
    </section>
  );
}
