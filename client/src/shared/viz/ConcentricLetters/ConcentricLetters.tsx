/**
 * ConcentricLetters — React-owns-DOM, D3-owns-math visualisation.
 *
 * Pattern: positions are computed by useConcentricLayout (pure D3 math),
 * then rendered as controlled SVG elements. No D3 DOM manipulation.
 *
 * Framer Motion animates:
 *   • mount: staggered fade-in ring by ring
 *   • center change: layoutId transition — peripheral letter glides to center
 *   • hover: scale + stroke highlight
 */

import { memo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDirection } from '@/shared/i18n/useDirection';
import { useReducedMotion } from '../shared/useReducedMotion';
import { useResizeObserver } from '../shared/useResizeObserver';
import { useConcentricLayout } from './useConcentricLayout';
import { interpolateFill, linkOpacity, CENTER_STROKE } from './colors';
import type { ConcentricLettersProps, RingNode } from './types';

// Stagger delay per ring (seconds)
const RING_STAGGER = [0, 0.08, 0.16] as const;

// SVG does not accept `dir` in React's type definition but it is valid HTML5.
// We cast the svg props to avoid TS2322 while keeping the attribute for
// bidi-override in RTL page contexts.
type LooseSVGProps = React.SVGProps<SVGSVGElement> & { dir?: string };
const LooseSVG = 'svg' as unknown as React.ComponentType<LooseSVGProps>;

// Same for <text> which may carry `dir` in SVG2 / HTML-embedded SVG context.
// We drop `dir` from text elements instead — single Arabic glyphs render
// correctly via the Amiri font's built-in shaping without an explicit `dir`.

// --- Sub-components ---

function EmptyStateSvg({
  cx,
  cy,
  letter,
  t,
}: {
  cx: number;
  cy: number;
  letter: string;
  t: (k: string) => string;
}) {
  return (
    <>
      <circle cx={cx} cy={cy} r={60} fill="var(--bg-card)" stroke={CENTER_STROKE} strokeWidth={2} />
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontSize={48}
        fontFamily="var(--font-arabic-title)"
        fill="var(--text-muted)"
        lang="ar"
      >
        {letter}
      </text>
      <text
        x={cx}
        y={cy + 90}
        textAnchor="middle"
        fontSize={13}
        fontFamily="var(--font-sans)"
        fill="var(--text-muted)"
      >
        {t('letters.empty')}
      </text>
    </>
  );
}

function LoadingRings({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      {[150, 250].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="4 8"
          opacity={0.4}
        />
      ))}
      <circle cx={cx} cy={cy} r={60} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={2} />
    </>
  );
}

// --- Tooltip panel ---

type TooltipInfo = {
  node: RingNode;
  svgX: number;
  svgY: number;
};

function LetterTooltip({
  info,
  onRootClick,
  t,
}: {
  info: TooltipInfo;
  onRootClick: (id: string) => void;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) {
  const { node } = info;
  const top5 = node.sharedRootIds.slice(0, 5);

  return (
    <motion.div
      key="tooltip"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.15 }}
      role="tooltip"
      className={clsx(
        'pointer-events-none absolute z-40',
        'rounded-xl border border-(--border) bg-(--bg-card) shadow-xl',
        'px-4 py-3 min-w-[160px] max-w-[240px]',
      )}
      style={{
        left: info.svgX,
        top: info.svgY - 12,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="text-center text-4xl mb-1"
        lang="ar"
        dir="rtl"
        style={{ fontFamily: 'var(--font-arabic-title)', color: 'var(--text-primary)' }}
      >
        {node.letter}
      </div>
      <p className="text-center text-xs text-(--text-muted) mb-2">
        {t('letters.sharedRoots', { count: node.sharedRootIds.length })}
      </p>
      {top5.length > 0 && (
        <ul className="flex flex-col gap-1">
          {top5.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="pointer-events-auto w-full text-start text-xs text-(--text-secondary) hover:text-(--text-primary) underline underline-offset-2 transition-colors"
                onClick={() => onRootClick(id)}
              >
                {id.slice(-8)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// --- Main component ---

function ConcentricLettersImpl({
  selectedLetter,
  data,
  onLetterSelect,
  width: _width,
  height: _height,
  showTooltip = true,
  isLoading = false,
  className,
}: ConcentricLettersProps) {
  const { t } = useTranslation(['letters', 'common']);
  const { isRTL } = useDirection();
  const reducedMotion = useReducedMotion();

  const { ref: containerRef, size } = useResizeObserver<HTMLDivElement>({
    width: _width ?? 600,
    height: _height ?? 600,
  });

  const effectiveSize = {
    width: size.width || _width || 600,
    height: size.height || _height || 600,
  };

  const layout = useConcentricLayout(data, effectiveSize, isRTL);
  const { centerNode, ringNodes, links } = layout;

  const [hovered, setHovered] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<TooltipInfo | null>(null);

  const handleNodeClick = useCallback(
    (letter: string) => {
      if (letter === selectedLetter) return;
      onLetterSelect(letter);
    },
    [selectedLetter, onLetterSelect],
  );

  const handleRootClick = useCallback((id: string) => {
    window.open(`/roots/${encodeURIComponent(id)}`, '_blank', 'noopener');
  }, []);

  const isEmpty = !data || data.cooccurrences.length === 0;
  const cx = centerNode.x;
  const cy = centerNode.y;

  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const dur = reducedMotion ? 0 : 0.3;
  const stagger = reducedMotion ? 0 : 0.02;

  return (
    <div
      ref={containerRef}
      className={clsx('relative w-full select-none', className)}
      style={{ minHeight: _height ?? 600 }}
      role="application"
      aria-label={t('letters.vizAriaLabel', { letter: selectedLetter })}
    >
      {/* LooseSVG: casts dir prop which is valid HTML5/SVG2 but missing from React's SVGProps */}
      <LooseSVG
        dir="ltr"
        width="100%"
        height={effectiveSize.height}
        viewBox={`0 0 ${effectiveSize.width} ${effectiveSize.height}`}
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Guide rings */}
        {!isEmpty && !isLoading && (
          <>
            {[150, 250, 350].map((r, i) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={Math.min(r, Math.min(cx, cy) - 8)}
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.5}
                opacity={i === 2 ? 0.2 : 0.3}
                strokeDasharray="3 9"
              />
            ))}
          </>
        )}

        {isLoading && <LoadingRings cx={cx} cy={cy} />}

        {!isLoading && isEmpty && (
          <EmptyStateSvg cx={cx} cy={cy} letter={selectedLetter} t={(k) => t(k)} />
        )}

        {/* Links */}
        {!isLoading && !isEmpty && (
          <g aria-hidden="true">
            {links.map((link, i) => {
              const node = ringNodes[i];
              if (!node) return null;
              const isHov = hovered === node.letter;
              return (
                <motion.line
                  key={`link-${node.letter}`}
                  x1={link.x1}
                  y1={link.y1}
                  x2={link.x2}
                  y2={link.y2}
                  stroke="var(--cat-derive-fill)"
                  strokeWidth={isHov ? link.strokeWidth * 1.8 : link.strokeWidth}
                  strokeOpacity={isHov ? 0.85 : linkOpacity(link.normFreq)}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: RING_STAGGER[node.ring] + node.ring * stagger,
                    duration: dur * 0.7,
                  }}
                />
              );
            })}
          </g>
        )}

        {/* Peripheral letter nodes */}
        {!isLoading && !isEmpty && (
          <AnimatePresence mode="popLayout">
            {ringNodes.map((node, i) => {
              const isHov = hovered === node.letter;
              const fill = interpolateFill(node.normFreq, isDark);
              const delay = RING_STAGGER[node.ring] + i * stagger;

              return (
                <motion.g
                  key={`node-${node.letter}`}
                  layoutId={`letter-${node.letter}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.letter} — ${node.count} ${t('letters.sharedRoots', { count: node.count })}`}
                  style={{ cursor: 'pointer' }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: isHov ? 1.12 : 1, x: node.x, y: node.y }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  transition={{
                    layout: { duration: dur, ease: [0.16, 1, 0.3, 1] },
                    opacity: { delay, duration: dur * 0.6 },
                    scale: { duration: 0.2 },
                  }}
                  onHoverStart={() => {
                    setHovered(node.letter);
                    if (showTooltip) {
                      setHoverTooltip({ node, svgX: node.x, svgY: node.y });
                    }
                  }}
                  onHoverEnd={() => {
                    setHovered(null);
                    setHoverTooltip(null);
                  }}
                  onClick={() => handleNodeClick(node.letter)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNodeClick(node.letter);
                    }
                  }}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={node.radius}
                    fill={fill}
                    stroke={isHov ? CENTER_STROKE : 'var(--border)'}
                    strokeWidth={isHov ? 2.5 : 1}
                  />
                  <text
                    x={0}
                    y={7}
                    textAnchor="middle"
                    fontSize={Math.max(16, node.radius * 0.9)}
                    fontFamily="var(--font-arabic-title)"
                    fill="var(--letter-ink, var(--text-primary))"
                    lang="ar"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.letter}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        )}

        {/* Center node */}
        {!isLoading && (
          <motion.g
            layoutId={`letter-${selectedLetter}`}
            style={{ cursor: isEmpty ? 'default' : 'pointer' }}
            onClick={() => !isEmpty && onLetterSelect(selectedLetter)}
            animate={{ x: cx, y: cy }}
            transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle
              cx={0}
              cy={0}
              r={60}
              fill={isDark ? 'oklch(0.18 0.08 250)' : 'oklch(0.92 0.08 250)'}
              stroke={CENTER_STROKE}
              strokeWidth={2.5}
            />
            <text
              x={0}
              y={22}
              textAnchor="middle"
              fontSize={56}
              fontFamily="var(--font-arabic-title)"
              fill="var(--text-primary)"
              lang="ar"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {selectedLetter}
            </text>
          </motion.g>
        )}
      </LooseSVG>

      {/* Tooltip overlay */}
      {showTooltip && (
        <AnimatePresence>
          {hoverTooltip && (
            <LetterTooltip
              info={hoverTooltip}
              onRootClick={handleRootClick}
              t={(k, o) => t(k, o)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Screen-reader list */}
      <ul className="sr-only">
        {ringNodes.map((n) => (
          <li key={n.letter}>
            {n.letter} — {n.count} {t('letters.sharedRoots', { count: n.count })}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const ConcentricLetters = memo(ConcentricLettersImpl, (prev, next) => {
  if (prev.selectedLetter !== next.selectedLetter) return false;
  if (prev.isLoading !== next.isLoading) return false;
  if (prev.data?.letter !== next.data?.letter) return false;
  if (prev.data?.cooccurrences.length !== next.data?.cooccurrences.length) return false;
  return true;
});
ConcentricLetters.displayName = 'ConcentricLetters';
