import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Constellation, type ConstellationLink, type ConstellationNode } from '@/shared/viz';

/**
 * Static placeholder dataset used until the `/api/constellation` route ships.
 * Centralised here so the API layer can drop in a `useConstellationQuery()` hook
 * later without touching the visualisation contract.
 */
function buildDemoData(): { nodes: ConstellationNode[]; links: ConstellationLink[] } {
  const nodes: ConstellationNode[] = [
    {
      id: 'ktb',
      letters: 'ك ت ب',
      transliteration: 'k-t-b',
      semanticField: 'écriture',
      masteryLevel: 3,
    },
    {
      id: 'qra',
      letters: 'ق ر أ',
      transliteration: 'q-r-ʾ',
      semanticField: 'lecture',
      masteryLevel: 2,
    },
    {
      id: 'qwl',
      letters: 'ق و ل',
      transliteration: 'q-w-l',
      semanticField: 'parole',
      masteryLevel: 4,
    },
    {
      id: 'smʿ',
      letters: 'س م ع',
      transliteration: 's-m-ʿ',
      semanticField: 'parole',
      masteryLevel: 1,
    },
    {
      id: 'fhm',
      letters: 'ف ه م',
      transliteration: 'f-h-m',
      semanticField: 'pensée',
      masteryLevel: 2,
    },
    {
      id: 'ḥb',
      letters: 'ح ب ب',
      transliteration: 'ḥ-b-b',
      semanticField: 'émotion',
      masteryLevel: 0,
    },
    {
      id: 'mšy',
      letters: 'م ش ي',
      transliteration: 'm-š-y',
      semanticField: 'mouvement',
      masteryLevel: 1,
    },
  ];
  const links: ConstellationLink[] = [
    { source: 'ktb', target: 'qra' },
    { source: 'qra', target: 'fhm' },
    { source: 'qwl', target: 'smʿ' },
    { source: 'fhm', target: 'qwl' },
    { source: 'ḥb', target: 'qwl' },
    { source: 'mšy', target: 'fhm' },
  ];
  return { nodes, links };
}

export default function ConstellationPage() {
  const { t } = useTranslation(['nav']);
  const { nodes, links } = useMemo(() => buildDemoData(), []);

  const handleNodeClick = useCallback((id: string) => {
    console.info('[ConstellationPage] node selected:', id);
  }, []);

  return (
    <main id="main" className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t('nav:constellation')}</h1>
      <Constellation nodes={nodes} links={links} onNodeClick={handleNodeClick} />
    </main>
  );
}
