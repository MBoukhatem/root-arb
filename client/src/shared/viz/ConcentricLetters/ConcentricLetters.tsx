/**
 * ConcentricLetters — React owns DOM, D3 owns math.
 *
 * Pattern: positions are computed by `useConcentricLayout` in a fixed
 * 1000×1000 square coordinate space. The SVG uses `viewBox="0 0 1000 1000"`
 * with `preserveAspectRatio="xMidYMid meet"` and the container forces a
 * square aspect ratio. Result: circles always render as circles, no matter
 * the viewport.
 *
 * Lettres are placed via STATIC `<g transform="translate(x,y)">` — animations
 * live on inner `<motion.circle>` (opacity + scale only). On évite ainsi le
 * conflit `layoutId` × `animate={{x,y}}` qui empilait les lettres au coin
 * supérieur gauche.
 */

import { memo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDirection } from '@/shared/i18n/useDirection';
import { useReducedMotion } from '../shared/useReducedMotion';
import { useConcentricLayout, VIEWBOX_SIZE } from './useConcentricLayout';
import { interpolateFill, linkOpacity, CENTER_STROKE } from './colors';
import type { ConcentricLettersProps, RingNode } from './types';

const RING_STAGGER = [0, 0.06, 0.12] as const;
const CENTER_RADIUS = 75;

type TooltipInfo = {
  node: RingNode;
  // Position in % of SVG box (so it follows when the SVG scales).
  pctX: number;
  pctY: number;
};

// --- Empty / loading states ----------------------------------------------

function EmptyStateSvg({ letter, t }: { letter: string; t: (k: string) => string }) {
  const cx = VIEWBOX_SIZE / 2;
  const cy = VIEWBOX_SIZE / 2;
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={CENTER_RADIUS}
        fill="var(--bg-card)"
        stroke={CENTER_STROKE}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        fontSize={72}
        fontFamily="var(--font-arabic-title)"
        fill="var(--text-muted)"
        lang="ar"
      >
        {letter}
      </text>
      <text
        x={cx}
        y={cy + CENTER_RADIUS + 50}
        textAnchor="middle"
        fontSize={20}
        fontFamily="var(--font-sans)"
        fill="var(--text-muted)"
      >
        {t('empty')}
      </text>
    </>
  );
}

function LoadingRings() {
  const cx = VIEWBOX_SIZE / 2;
  const cy = VIEWBOX_SIZE / 2;
  return (
    <>
      {[170, 250, 330].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1.5}
          strokeDasharray="6 12"
          opacity={0.35}
        />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={CENTER_RADIUS}
        fill="var(--bg-card)"
        stroke="var(--border)"
        strokeWidth={2}
      />
    </>
  );
}

// --- Tooltip overlay -----------------------------------------------------

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
        left: `${info.pctX}%`,
        top: `${info.pctY}%`,
        transform: 'translate(-50%, calc(-100% - 12px))',
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
        {t('sharedRoots', { count: node.sharedRootIds.length })}
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

// --- Main component ------------------------------------------------------

function ConcentricLettersImpl({
  selectedLetter,
  data,
  onLetterSelect,
  showTooltip = true,
  isLoading = false,
  className,
}: ConcentricLettersProps) {
  const { t } = useTranslation(['letters', 'common']);
  const { isRTL } = useDirection();
  const reducedMotion = useReducedMotion();

  // Layout is computed in 1000×1000 viewBox coords — size irrelevant.
  const layout = useConcentricLayout(data, { width: VIEWBOX_SIZE, height: VIEWBOX_SIZE }, isRTL);
  const { ringNodes, links } = layout;

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
  const cx = VIEWBOX_SIZE / 2;
  const cy = VIEWBOX_SIZE / 2;

  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const dur = reducedMotion ? 0 : 0.28;
  const stagger = reducedMotion ? 0 : 0.015;

  return (
    <div
      className={clsx('relative mx-auto aspect-square w-full max-w-[640px] select-none', className)}
      role="application"
      aria-label={t('vizAriaLabel', { letter: selectedLetter })}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Guide rings */}
        {!isEmpty && !isLoading && (
          <g aria-hidden="true">
            {[0.42, 0.62, 0.82].map((f, i) => (
              <circle
                key={f}
                cx={cx}
                cy={cy}
                r={(cx - 95) * f}
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.8}
                opacity={i === 2 ? 0.18 : 0.32}
                strokeDasharray="4 10"
              />
            ))}
          </g>
        )}

        {isLoading && <LoadingRings />}

        {!isLoading && isEmpty && <EmptyStateSvg letter={selectedLetter} t={(k) => t(k)} />}

        {/* Links centre → périphérie */}
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

        {/* Peripheral letter nodes — positioned via static transform,
             animations live on inner motion elements only. */}
        {!isLoading &&
          !isEmpty &&
          ringNodes.map((node, i) => {
            const isHov = hovered === node.letter;
            const fill = interpolateFill(node.normFreq, isDark);
            const delay = RING_STAGGER[node.ring] + i * stagger;

            return (
              <g
                key={`node-${node.letter}`}
                transform={`translate(${node.x}, ${node.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${node.letter} — ${node.sharedRootIds.length} ${t('sharedRoots', { count: node.sharedRootIds.length })}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  setHovered(node.letter);
                  if (showTooltip) {
                    setHoverTooltip({
                      node,
                      pctX: (node.x / VIEWBOX_SIZE) * 100,
                      pctY: (node.y / VIEWBOX_SIZE) * 100,
                    });
                  }
                }}
                onMouseLeave={() => {
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
                <motion.circle
                  cx={0}
                  cy={0}
                  r={node.radius}
                  fill={fill}
                  stroke={isHov ? CENTER_STROKE : 'var(--border)'}
                  strokeWidth={isHov ? 3 : 1.2}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: isHov ? 1.1 : 1 }}
                  transition={{
                    opacity: { delay, duration: dur * 0.6 },
                    scale: { duration: 0.2 },
                  }}
                  style={{ transformOrigin: 'center' }}
                />
                <text
                  x={0}
                  y={node.radius * 0.32}
                  textAnchor="middle"
                  fontSize={Math.max(28, node.radius * 1.0)}
                  fontFamily="var(--font-arabic-title)"
                  fill="var(--letter-ink, var(--text-primary))"
                  lang="ar"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.letter}
                </text>
              </g>
            );
          })}

        {/* Center node */}
        {!isLoading && (
          <g
            transform={`translate(${cx}, ${cy})`}
            style={{ cursor: isEmpty ? 'default' : 'default' }}
          >
            <motion.circle
              cx={0}
              cy={0}
              r={CENTER_RADIUS}
              fill={isDark ? 'oklch(0.18 0.08 250)' : 'oklch(0.92 0.08 250)'}
              stroke={CENTER_STROKE}
              strokeWidth={3}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'center' }}
            />
            <text
              x={0}
              y={28}
              textAnchor="middle"
              fontSize={84}
              fontFamily="var(--font-arabic-title)"
              fill="var(--text-primary)"
              lang="ar"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {selectedLetter}
            </text>
          </g>
        )}
      </svg>

      {/* Tooltip overlay (CSS positioned, follows SVG scaling via %) */}
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
            {n.letter} — {n.count} {t('sharedRoots', { count: n.sharedRootIds.length })}
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
