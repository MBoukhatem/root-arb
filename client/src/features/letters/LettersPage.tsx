/**
 * /letters — ConcentricLetters visualisation page.
 *
 * Layout:
 *   - Alphabet picker (28-letter grid) to select initial letter
 *   - Stats counter "X racines contiennent cette lettre"
 *   - ConcentricLetters viz occupying ~60vh
 *   - Side panel (sheet) listing shared roots when a peripheral letter is hovered/clicked
 *   - Dark mode + RTL aware
 */

import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Hash } from 'lucide-react';
import clsx from 'clsx';
import { ConcentricLetters } from '@/shared/viz/ConcentricLetters';
import { useLettersList, useCooccurrences } from './hooks/useCooccurrences';
import type { RingNode } from '@/shared/viz/ConcentricLetters/types';

// Canonical 28 Arabic letters — fallback when API hasn't loaded yet
const ARABIC_ALPHABET = [
  'ا',
  'ب',
  'ت',
  'ث',
  'ج',
  'ح',
  'خ',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ع',
  'غ',
  'ف',
  'ق',
  'ك',
  'ل',
  'م',
  'ن',
  'ه',
  'و',
  'ي',
] as const;

// --- Alphabet picker grid ---

function AlphabetPicker({
  letters,
  selected,
  onSelect,
}: {
  letters: { letter: string; count: number }[];
  selected: string;
  onSelect: (l: string) => void;
}) {
  const { t } = useTranslation(['letters', 'common']);

  return (
    <section aria-label={t('letters.pickerAriaLabel')}>
      <div className="flex flex-wrap gap-1.5 justify-center" dir="rtl">
        {letters.map(({ letter, count }) => (
          <button
            key={letter}
            type="button"
            title={`${letter} — ${count} ${t('letters.roots', { count })}`}
            aria-pressed={letter === selected}
            onClick={() => onSelect(letter)}
            className={clsx(
              'relative w-10 h-10 rounded-lg text-xl transition-all duration-150',
              'flex items-center justify-center',
              'border focus-visible:outline-2 focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2',
              letter === selected
                ? 'border-(--gold) bg-(--bg-card) text-(--text-primary) shadow-md scale-110'
                : 'border-(--border) bg-(--bg-base) text-(--text-secondary) hover:border-(--gold) hover:text-(--text-primary) hover:scale-105',
            )}
            style={{ fontFamily: 'var(--font-arabic-title)' }}
          >
            {letter}
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-(--cat-derive-fill) text-white text-[9px] flex items-center justify-center px-0.5 leading-none"
                aria-hidden="true"
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

// --- Side panel for selected node details ---

function RootSidePanel({ node, onClose }: { node: RingNode | null; onClose: () => void }) {
  const { t } = useTranslation(['letters', 'common']);

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key="side-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={clsx(
            'absolute inset-y-0 end-0 w-72 z-30',
            'bg-(--bg-card) border-s border-(--border)',
            'flex flex-col overflow-hidden rounded-e-xl',
            'shadow-2xl',
          )}
          aria-label={t('letters.sidePanelAriaLabel')}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
            <div className="flex items-center gap-3">
              <span
                className="text-4xl"
                lang="ar"
                dir="rtl"
                style={{ fontFamily: 'var(--font-arabic-title)', color: 'var(--text-primary)' }}
              >
                {node.letter}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-(--text-primary)">
                  {t('letters.sharedRoots', { count: node.sharedRootIds.length })}
                </span>
                <span className="text-xs text-(--text-muted)">
                  {t('letters.cooccurrenceCount', { count: node.count })}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common:close')}
              className="rounded-md p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-base) transition-colors"
            >
              <X size={16} aria-hidden />
            </button>
          </div>

          {/* Root list */}
          <div className="flex-1 overflow-y-auto p-4">
            {node.sharedRootIds.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t('letters.noRoots')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {node.sharedRootIds.map((id) => (
                  <li key={id}>
                    <Link
                      to={`/roots/${encodeURIComponent(id)}`}
                      className={clsx(
                        'flex items-center gap-2 rounded-lg px-3 py-2',
                        'border border-(--border) bg-(--bg-base)',
                        'hover:border-(--gold) hover:bg-(--bg-card)',
                        'text-sm text-(--text-secondary) hover:text-(--text-primary)',
                        'transition-all duration-150',
                      )}
                    >
                      <Hash size={12} className="shrink-0 text-(--text-muted)" aria-hidden />
                      <span className="font-mono text-xs break-all">{id}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// --- Page ---

export default function LettersPage() {
  const { t } = useTranslation(['letters', 'common']);

  // Merge API letter list with canonical alphabet as fallback
  const { data: apiLetters } = useLettersList();
  const letterList = useMemo(() => {
    if (apiLetters) return apiLetters;
    return ARABIC_ALPHABET.map((l) => ({ letter: l, count: 0 }));
  }, [apiLetters]);

  const [selectedLetter, setSelectedLetter] = useState<string>('ك');
  const [activePanelNode, setActivePanelNode] = useState<RingNode | null>(null);

  const { data, isPending, isError } = useCooccurrences(selectedLetter);

  const handleLetterSelect = useCallback((letter: string) => {
    setSelectedLetter(letter);
    setActivePanelNode(null);
  }, []);

  const totalRoots = data?.totalRootsWithLetter ?? 0;

  return (
    <section
      className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 p-6"
      aria-label={t('letters.pageAriaLabel')}
    >
      {/* Page header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('letters.title')}</h1>
        <p className="text-(--text-muted)">{t('letters.subtitle')}</p>
      </header>

      {/* Alphabet picker */}
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
        <AlphabetPicker
          letters={letterList}
          selected={selectedLetter}
          onSelect={handleLetterSelect}
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-card) px-5 py-3">
        <span
          className="text-3xl"
          lang="ar"
          dir="rtl"
          style={{ fontFamily: 'var(--font-arabic-title)', color: 'var(--gold)' }}
        >
          {selectedLetter}
        </span>
        <div className="flex flex-col">
          {isPending ? (
            <span className="flex items-center gap-2 text-sm text-(--text-muted)">
              <Loader2 size={14} className="animate-spin" aria-hidden />
              {t('common:loading')}
            </span>
          ) : isError ? (
            <span className="text-sm text-(--danger)">{t('common:error')}</span>
          ) : (
            <>
              <span className="text-lg font-semibold text-(--text-primary)">
                {t('letters.rootCount', { count: totalRoots })}
              </span>
              {data && data.cooccurrences.length > 0 && (
                <span className="text-xs text-(--text-muted)">
                  {t('letters.neighbourCount', { count: data.cooccurrences.length })}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Viz + side panel */}
      <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--bg-card)">
        <ConcentricLetters
          selectedLetter={selectedLetter}
          data={data ?? null}
          onLetterSelect={handleLetterSelect}
          height={Math.round(window.innerHeight * 0.6)}
          showTooltip={activePanelNode === null}
          isLoading={isPending}
          className="min-h-[420px]"
        />

        <RootSidePanel node={activePanelNode} onClose={() => setActivePanelNode(null)} />
      </div>

      {/* Mobile CTA (sr-accessible note) */}
      <p className="sr-only sm:hidden">{t('letters.mobileHint')}</p>
    </section>
  );
}
