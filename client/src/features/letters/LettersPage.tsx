/**
 * /letters — Trilitère root builder + ConcentricLetters viz.
 *
 * Workflow:
 *   1. Clic sur une lettre dans le picker → ajoutée au buffer (max 3 lettres).
 *   2. La viz ConcentricLetters montre la dernière lettre choisie au centre,
 *      entourée de ses co-occurrences (autres lettres présentes dans les
 *      mêmes racines).
 *   3. Lorsque le buffer atteint 3 lettres, on cherche la racine correspondante
 *      dans la liste seedée. Si trouvée, lien direct vers /roots/:id.
 *      Sinon : message "combinaison inédite".
 *   4. Boutons "Retour" (pop la dernière) et "Réinitialiser" (clear).
 */

import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Hash, RotateCcw, Undo2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { ConcentricLetters } from '@/shared/viz/ConcentricLetters';
import { useLettersList } from './hooks/useCooccurrences';
import { useRoots } from '@/features/roots/hooks/useRoots';
import type { RingNode } from '@/shared/viz/ConcentricLetters/types';

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

const MAX_LETTERS = 3;

// --- Builder slots ---

function BuilderSlots({
  buffer,
  onPop,
  onReset,
}: {
  buffer: string[];
  onPop: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation(['letters', 'common']);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs uppercase tracking-[0.18em] text-(--text-muted)">
        {t('buildHint')}
      </span>
      <div className="flex items-center gap-2" dir="rtl">
        {Array.from({ length: MAX_LETTERS }).map((_, i) => {
          const letter = buffer[i];
          return (
            <div
              key={i}
              className={clsx(
                'flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-200',
                letter
                  ? 'border-(--gold-accent) bg-(--bg-card) shadow-[var(--shadow-md)]'
                  : 'border-dashed border-(--border-interactive) bg-(--bg-base)',
              )}
              aria-label={t('slot', { n: i + 1 })}
            >
              <AnimatePresence mode="wait">
                {letter ? (
                  <motion.span
                    key={letter + i}
                    initial={{ opacity: 0, scale: 0.5, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl text-(--text-primary)"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-arabic-title)' }}
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <span className="text-2xl text-(--text-muted)" aria-hidden>
                    +
                  </span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPop}
          disabled={buffer.length === 0}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--bg-card) px-4 py-2 text-sm',
            'transition-colors duration-150',
            'hover:border-(--gold-accent) hover:text-(--text-primary)',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--border-strong)',
            'text-(--text-secondary)',
          )}
        >
          <Undo2 size={14} aria-hidden />
          {t('back')}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={buffer.length === 0}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--bg-card) px-4 py-2 text-sm',
            'transition-colors duration-150',
            'hover:border-(--terracotta) hover:text-(--text-primary)',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--border-strong)',
            'text-(--text-secondary)',
          )}
        >
          <RotateCcw size={14} aria-hidden />
          {t('reset')}
        </button>
      </div>
    </div>
  );
}

// --- Alphabet picker ---

function AlphabetPicker({
  letters,
  buffer,
  focal,
  onSelect,
}: {
  letters: { letter: string; count: number }[];
  buffer: string[];
  focal: string | null;
  onSelect: (l: string) => void;
}) {
  const { t } = useTranslation(['letters', 'common']);
  const bufferFull = buffer.length >= MAX_LETTERS;

  return (
    <section aria-label={t('pickerAriaLabel')}>
      <div className="flex flex-wrap gap-1.5 justify-center" dir="rtl">
        {letters.map(({ letter, count }) => {
          const isFocal = focal === letter;
          const inBuffer = buffer.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              title={`${letter} — ${count} ${t('roots', { count })}`}
              aria-pressed={isFocal}
              disabled={bufferFull && !inBuffer}
              onClick={() => onSelect(letter)}
              className={clsx(
                'relative w-11 h-11 rounded-lg text-xl transition-all duration-150',
                'flex items-center justify-center',
                'border focus-visible:outline-2 focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-40',
                isFocal
                  ? 'border-(--gold-accent) bg-(--bg-card) text-(--text-primary) shadow-md scale-110'
                  : inBuffer
                    ? 'border-(--gold-accent)/60 bg-(--bg-card)/60 text-(--text-primary)'
                    : 'border-(--border) bg-(--bg-base) text-(--text-secondary) hover:border-(--gold-accent) hover:text-(--text-primary) hover:scale-105',
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
          );
        })}
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
          aria-label={t('sidePanelAriaLabel')}
        >
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
                  {t('sharedRoots', { count: node.sharedRootIds.length })}
                </span>
                <span className="text-xs text-(--text-muted)">
                  {t('cooccurrenceCount', { count: node.count })}
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

          <div className="flex-1 overflow-y-auto p-4">
            {node.sharedRootIds.length === 0 ? (
              <p className="text-sm text-(--text-muted)">{t('noRoots')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {node.sharedRootIds.map((id) => (
                  <li key={id}>
                    <Link
                      to={`/roots/${encodeURIComponent(id)}`}
                      className={clsx(
                        'flex items-center gap-2 rounded-lg px-3 py-2',
                        'border border-(--border) bg-(--bg-base)',
                        'hover:border-(--gold-accent) hover:bg-(--bg-card)',
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

  const { data: apiLetters } = useLettersList();
  const letterList = useMemo(() => {
    if (apiLetters) return apiLetters;
    return ARABIC_ALPHABET.map((l) => ({ letter: l, count: 0 }));
  }, [apiLetters]);

  // Fetch all roots once to detect when buffer matches a known trilitère.
  const { data: allRoots } = useRoots({ page: 1, limit: 100 });

  const [buffer, setBuffer] = useState<string[]>([]);
  const [activePanelNode, setActivePanelNode] = useState<RingNode | null>(null);

  // Focal letter (centre du viz) = dernière lettre du buffer, ou null si vide.
  const focal = buffer[buffer.length - 1] ?? null;

  /**
   * Co-occurrences = INTERSECTION des lettres choisies (pas juste la dernière).
   * Ex: buffer = [ك, ت] → on cherche les racines contenant ك ET ت, puis on
   * compte les autres lettres présentes dans CES racines uniquement.
   * Quand buffer.length === 3 et la racine existe, cooccurrences = [] (la
   * racine est complète, plus de voisines à proposer).
   * Calculé côté client à partir de useRoots — pas de nouvel endpoint requis.
   */
  const data = useMemo(() => {
    if (!focal || !allRoots) return null;
    const matchingRoots = allRoots.roots.filter((r) =>
      buffer.every((l) => r.lettersArray.includes(l)),
    );
    const counts = new Map<string, { count: number; sharedRootIds: string[] }>();
    for (const root of matchingRoots) {
      for (const letter of root.lettersArray) {
        if (buffer.includes(letter)) continue;
        const entry = counts.get(letter) ?? { count: 0, sharedRootIds: [] };
        entry.count += 1;
        entry.sharedRootIds.push(root._id);
        counts.set(letter, entry);
      }
    }
    const cooccurrences = Array.from(counts.entries())
      .map(([letter, v]) => ({ letter, count: v.count, sharedRootIds: v.sharedRootIds }))
      .sort((a, b) => b.count - a.count);
    return {
      letter: focal,
      totalRootsWithLetter: matchingRoots.length,
      cooccurrences,
      generatedAt: new Date().toISOString(),
    };
  }, [focal, buffer, allRoots]);
  const isPending = !allRoots;
  const isError = false;

  const handleLetterSelect = useCallback((letter: string) => {
    setBuffer((curr) => {
      if (curr.length >= MAX_LETTERS) return curr;
      return [...curr, letter];
    });
    setActivePanelNode(null);
  }, []);

  const handlePop = useCallback(() => {
    setBuffer((curr) => curr.slice(0, -1));
    setActivePanelNode(null);
  }, []);

  const handleReset = useCallback(() => {
    setBuffer([]);
    setActivePanelNode(null);
  }, []);

  // Détection racine trilitère complète
  const foundRoot = useMemo(() => {
    if (buffer.length !== MAX_LETTERS || !allRoots) return null;
    return (
      allRoots.roots.find(
        (r) =>
          r.lettersArray.length === MAX_LETTERS && r.lettersArray.every((l, i) => l === buffer[i]),
      ) ?? 'NOT_FOUND'
    );
  }, [buffer, allRoots]);

  const totalRoots = data?.totalRootsWithLetter ?? 0;

  return (
    <section
      className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 p-6"
      aria-label={t('pageAriaLabel')}
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-(--text-primary)">{t('buildTitle')}</h1>
        <p className="text-(--text-muted)">{t('subtitle')}</p>
      </header>

      {/* Builder slots */}
      <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6 shadow-[var(--shadow-sm)]">
        <BuilderSlots buffer={buffer} onPop={handlePop} onReset={handleReset} />
      </div>

      {/* Found root banner */}
      <AnimatePresence>
        {foundRoot && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className={clsx(
              'flex items-center justify-between gap-3 rounded-xl border px-5 py-3',
              foundRoot === 'NOT_FOUND'
                ? 'border-(--terracotta)/40 bg-(--bg-card) text-(--text-secondary)'
                : 'border-(--gold-accent) bg-(--bg-card) text-(--text-primary) shadow-[var(--shadow-gold)]',
            )}
          >
            {foundRoot === 'NOT_FOUND' ? (
              <span className="text-sm">{t('rootNotInDb', { letters: buffer.join('-') })}</span>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl"
                    lang="ar"
                    dir="rtl"
                    style={{ fontFamily: 'var(--font-arabic-title)' }}
                  >
                    {foundRoot.letters}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{t('rootFound')}</span>
                    <span className="text-xs text-(--text-muted)">{foundRoot.transliteration}</span>
                  </div>
                </div>
                <Link
                  to={`/roots/${encodeURIComponent(foundRoot._id)}`}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full',
                    'bg-(--text-primary) text-(--bg-base) px-4 py-1.5 text-sm font-medium',
                    'hover:opacity-90 transition-opacity',
                  )}
                >
                  {t('openRoot')}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alphabet picker — hidden once the buffer is full (3 letters reached).
          User must Reset or Pop to choose again. */}
      {buffer.length < MAX_LETTERS && (
        <div className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
          <AlphabetPicker
            letters={letterList}
            buffer={buffer}
            focal={focal}
            onSelect={handleLetterSelect}
          />
        </div>
      )}

      {/* Stats bar — only when focal letter exists */}
      {focal && (
        <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-card) px-5 py-3">
          <span
            className="text-3xl"
            lang="ar"
            dir="rtl"
            style={{ fontFamily: 'var(--font-arabic-title)', color: 'var(--gold-accent)' }}
          >
            {focal}
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
                  {t('rootCount', { count: totalRoots })}
                </span>
                {data && data.cooccurrences.length > 0 && (
                  <span className="text-xs text-(--text-muted)">
                    {t('neighbourCount', { count: data.cooccurrences.length })}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Viz + side panel — hidden at buffer.length === 3 (banner above suffit) */}
      {buffer.length < MAX_LETTERS && (
        <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) p-4">
          {focal ? (
            <ConcentricLetters
              selectedLetter={focal}
              data={data ?? null}
              onLetterSelect={handleLetterSelect}
              showTooltip={activePanelNode === null}
              isLoading={isPending}
            />
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center gap-2 text-center">
              <span className="text-5xl text-(--text-muted)" aria-hidden>
                ✦
              </span>
              <p className="text-(--text-muted)">{t('buildHint')}</p>
            </div>
          )}

          <RootSidePanel node={activePanelNode} onClose={() => setActivePanelNode(null)} />
        </div>
      )}

      <p className="sr-only sm:hidden">{t('mobileHint')}</p>
    </section>
  );
}
