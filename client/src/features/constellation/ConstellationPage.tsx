import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Compass } from 'lucide-react';
import { useConstellation } from './hooks/useConstellation';
import { Constellation, type ConstellationLink, type ConstellationNode } from '@/shared/viz';
import { FilterPill } from '@/shared/ui/FilterPill';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Button } from '@/shared/ui/Button';
import { SEMANTIC_FIELDS, type SemanticField } from '@/types/models';

export default function ConstellationPage() {
  const { t } = useTranslation(['constellation', 'common', 'roots']);
  const navigate = useNavigate();
  const [semanticField, setSemanticField] = useState<SemanticField | null>(null);
  const [minMastery, setMinMastery] = useState<number | null>(null);
  const { data, isPending, isError, refetch } = useConstellation({ semanticField, minMastery });

  const handleNodeClick = useCallback(
    (id: string) => navigate(`/roots/${encodeURIComponent(id)}`),
    [navigate],
  );

  const vizPayload = useMemo(() => {
    if (!data) return { nodes: [] as ConstellationNode[], links: [] as ConstellationLink[] };
    return {
      nodes: data.nodes.map<ConstellationNode>((n) => ({
        id: n.id,
        letters: n.letters,
        transliteration: '',
        semanticField: n.semanticField,
        masteryLevel: n.masteryLevel ?? 0,
      })),
      links: data.links.map<ConstellationLink>((l) => ({
        source: l.source,
        target: l.target,
      })),
    };
  }, [data]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('constellation:title')}</h1>
        <p className="text-(--text-muted)">{t('constellation:subtitle')}</p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-4">
        <span className="text-sm font-medium text-(--text-secondary)">
          {t('roots:filterBySemanticField')}
        </span>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={semanticField === null} onClick={() => setSemanticField(null)}>
            {t('constellation:allFields')}
          </FilterPill>
          {SEMANTIC_FIELDS.map((f) => (
            <FilterPill key={f} active={semanticField === f} onClick={() => setSemanticField(f)}>
              {t(`roots:semanticField.${f}`)}
            </FilterPill>
          ))}
        </div>
        <span className="text-sm font-medium text-(--text-secondary)">
          {t('constellation:masteryFilter')}
        </span>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={minMastery === null} onClick={() => setMinMastery(null)}>
            {t('constellation:allLevels')}
          </FilterPill>
          {[1, 2, 3, 4, 5].map((level) => (
            <FilterPill
              key={level}
              active={minMastery === level}
              onClick={() => setMinMastery(level)}
            >
              {`>= ${level}`}
            </FilterPill>
          ))}
        </div>
      </div>

      {isPending ? (
        <Skeleton variant="tree" />
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle size={32} aria-hidden />}
          title={t('common:error')}
          action={<Button onClick={() => void refetch()}>{t('common:retry')}</Button>}
        />
      ) : vizPayload.nodes.length === 0 ? (
        <EmptyState
          icon={<Compass size={32} aria-hidden />}
          title={t('constellation:emptyTitle')}
          description={t('constellation:emptyDescription')}
        />
      ) : (
        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-4">
          <Constellation
            nodes={vizPayload.nodes}
            links={vizPayload.links}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}
    </section>
  );
}
