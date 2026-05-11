import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDirection } from '@/shared/i18n/useDirection';
import { useResizeObserver } from '../shared/useResizeObserver';
import { useMediaQuery, useReducedMotion } from '../shared/useReducedMotion';
import { useRootTreeLayout, type LayoutNode } from './useRootTreeLayout';
import { categoryFill, categoryInk } from './colors';
import type { RootTreeProps } from './RootTree.types';

const NODE_RADIUS = 28;
const ROOT_RADIUS = 56;

type TooltipState = {
  node: LayoutNode;
  x: number;
  y: number;
} | null;

/**
 * Returns the appropriate SVG text-anchor for a label sitting at the given
 * polar angle (radians, d3.tree convention with 0 at top). Mirrored when RTL
 * so labels never overlap their edge.
 */
function textAnchorForAngle(angle: number, isRTL: boolean): 'start' | 'middle' | 'end' {
  // Normalise to [0, 2pi)
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  // Right half (angle in (0, pi)) -> text on the right of node
  if (a > 0.05 && a < Math.PI - 0.05) {
    return isRTL ? 'end' : 'start';
  }
  if (a > Math.PI + 0.05 && a < 2 * Math.PI - 0.05) {
    return isRTL ? 'start' : 'end';
  }
  return 'middle';
}

function RootTreeImpl({ root, words, onWordClick, className }: RootTreeProps) {
  const { t, i18n } = useTranslation(['common']);
  const { isRTL } = useDirection();
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const { ref: containerRef, size } = useResizeObserver<HTMLDivElement>({
    width: 720,
    height: 520,
  });

  const lang: 'fr' | 'en' = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';
  const mode = isDesktop ? 'radial' : 'vertical';
  const layout = useRootTreeLayout({ root, words }, size, mode, lang);

  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleNodeActivate = useCallback(
    (node: LayoutNode) => {
      if (!node.data.wordId || !onWordClick) return;
      onWordClick(node.data.wordId);
    },
    [onWordClick],
  );

  // Keyboard navigation across word nodes (the root itself is not in the cycle).
  const wordNodes = useMemo(() => layout.nodes.filter((n) => n.data.wordId), [layout.nodes]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<SVGGElement>, node: LayoutNode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNodeActivate(node);
        return;
      }
      const idx = wordNodes.findIndex((n) => n.id === node.id);
      if (idx === -1) return;

      let nextIdx: number;
      switch (e.key) {
        case 'ArrowRight':
          nextIdx = isRTL ? idx - 1 : idx + 1;
          break;
        case 'ArrowLeft':
          nextIdx = isRTL ? idx + 1 : idx - 1;
          break;
        case 'ArrowDown':
          nextIdx = idx + 1;
          break;
        case 'ArrowUp':
          nextIdx = idx - 1;
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = wordNodes.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const safe = ((nextIdx % wordNodes.length) + wordNodes.length) % wordNodes.length;
      const target = wordNodes[safe];
      setFocusedId(target.id);
      const el = svgRef.current?.querySelector<SVGGElement>(`[data-node-id="${target.id}"]`);
      el?.focus();
    },
    [handleNodeActivate, isRTL, wordNodes],
  );

  const handleReplay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  // Tooltip positioning relative to the SVG container
  const showTooltip = useCallback((node: LayoutNode) => {
    setTooltip({ node, x: node.x, y: node.y });
  }, []);
  const hideTooltip = useCallback(() => setTooltip(null), []);

  // Drop any stale tooltip whenever the layout reshapes. Pattern recommended
  // by React docs: derive state during render with a key, no effect needed.
  const layoutKey = `${layout.viewBox.width}x${layout.viewBox.height}:${layout.mode}`;
  const [lastLayoutKey, setLastLayoutKey] = useState(layoutKey);
  if (lastLayoutKey !== layoutKey) {
    setLastLayoutKey(layoutKey);
    if (tooltip !== null) setTooltip(null);
  }

  const ariaLabel = t('common:root-tree-aria', {
    defaultValue: 'Arbre des dérivés de la racine {{letters}}',
    letters: root.letters,
  });

  return (
    <div
      ref={containerRef}
      className={clsx('relative w-full', className)}
      style={{ minHeight: '60vh' }}
    >
      <button
        type="button"
        onClick={handleReplay}
        className="absolute right-2 top-2 z-10 rounded-md border border-(--border) bg-(--bg-card) px-3 py-1 text-xs text-(--text-secondary) hover:text-(--text-primary)"
        aria-label={t('common:replay-animation', { defaultValue: 'Rejouer l’animation' })}
      >
        {t('common:replay-animation', { defaultValue: 'Rejouer l’animation' })}
      </button>

      <svg
        ref={svgRef}
        role="tree"
        aria-label={ariaLabel}
        width="100%"
        height={layout.viewBox.height}
        viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', touchAction: 'manipulation' }}
      >
        <title>{ariaLabel}</title>
        <desc>{root.coreMeaning[lang] ?? root.coreMeaning.fr}</desc>

        {/* Links */}
        <g aria-hidden="true" fill="none" strokeWidth={2} strokeLinecap="round">
          {layout.links.map((link) => {
            const cat = link.target.data.category;
            const color = cat === 'root' ? 'var(--text-muted)' : categoryFill(cat);
            return (
              <motion.path
                key={`${link.source.id}->${link.target.id}-${replayKey}`}
                d={link.d}
                stroke={color}
                strokeOpacity={0.45}
                initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.5,
                  delay: reducedMotion ? 0 : 0.1 + link.target.depth * 0.05,
                  ease: 'easeOut',
                }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <AnimatePresence>
          {layout.nodes.map((node, i) => {
            const isRoot = node.data.category === 'root';
            const fill = isRoot ? 'var(--bg-card)' : categoryFill(node.data.category as never);
            const stroke = isRoot ? 'var(--gold)' : categoryInk(node.data.category as never);
            const radius = isRoot ? ROOT_RADIUS : NODE_RADIUS;
            const interactive = Boolean(node.data.wordId);

            const anchor =
              layout.mode === 'radial' ? textAnchorForAngle(node.raw.x, isRTL) : 'middle';

            const labelOffset =
              layout.mode === 'radial'
                ? anchor === 'middle'
                  ? 0
                  : anchor === (isRTL ? 'end' : 'start')
                    ? radius + 8
                    : -(radius + 8)
                : 0;

            const labelY = layout.mode === 'vertical' ? radius + 18 : 4;

            return (
              <motion.g
                key={`${node.id}-${replayKey}`}
                data-node-id={node.id}
                role={isRoot ? 'group' : 'treeitem'}
                aria-level={isRoot ? 1 : 2}
                aria-label={
                  isRoot
                    ? `${root.letters} (${root.transliteration})`
                    : `${node.data.label}, ${node.data.transliteration}, ${node.data.translation}`
                }
                tabIndex={interactive ? 0 : -1}
                transform={`translate(${node.x},${node.y})`}
                initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.4,
                  delay: reducedMotion ? 0 : 0.15 + i * 0.05,
                  ease: 'easeOut',
                }}
                whileHover={interactive && !reducedMotion ? { scale: 1.1 } : undefined}
                whileFocus={interactive && !reducedMotion ? { scale: 1.1 } : undefined}
                onMouseEnter={() => interactive && showTooltip(node)}
                onMouseLeave={hideTooltip}
                onFocus={() => {
                  if (!interactive) return;
                  setFocusedId(node.id);
                  showTooltip(node);
                }}
                onBlur={hideTooltip}
                onClick={() => handleNodeActivate(node)}
                onKeyDown={(e) => handleKeyDown(e, node)}
                style={{
                  cursor: interactive ? 'pointer' : 'default',
                  outline: focusedId === node.id ? '2px solid var(--focus-ring)' : 'none',
                  outlineOffset: 4,
                }}
              >
                <circle
                  r={radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isRoot ? 3 : 2}
                  fillOpacity={isRoot ? 1 : 0.18}
                />
                {/* Arabic glyph inside node */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isRoot ? 36 : 18}
                  fontFamily="var(--font-arabic-title)"
                  fill={isRoot ? 'var(--text-primary)' : stroke}
                  lang="ar"
                  direction="rtl"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.data.label}
                </text>
                {/* Side label (transliteration) for word nodes only */}
                {!isRoot && (
                  <text
                    x={labelOffset}
                    y={labelY}
                    textAnchor={anchor}
                    fontSize={12}
                    fontFamily="var(--font-sans)"
                    fill="var(--text-secondary)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.data.transliteration}
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Tooltip */}
      {tooltip && tooltip.node.data.wordId && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-(--border) bg-(--bg-card) px-3 py-2 text-xs text-(--text-primary) shadow-md"
          style={{
            left: `${(tooltip.x / layout.viewBox.width) * 100}%`,
            top: `${((tooltip.y - NODE_RADIUS - 8) / layout.viewBox.height) * 100}%`,
          }}
        >
          <div className="font-arabic-title text-base" lang="ar" dir="rtl">
            {tooltip.node.data.label}
          </div>
          <div className="italic text-(--text-secondary)">{tooltip.node.data.transliteration}</div>
          <div>{tooltip.node.data.translation}</div>
        </div>
      )}

      {/* Screen-reader fallback list */}
      <ul className="sr-only">
        {wordNodes.map((n) => (
          <li key={n.id}>
            {n.data.label} — {n.data.transliteration} — {n.data.translation}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const RootTree = memo(RootTreeImpl, (prev, next) => {
  if (prev.onWordClick !== next.onWordClick) return false;
  if (prev.className !== next.className) return false;
  if (prev.root.letters !== next.root.letters) return false;
  if (prev.words.length !== next.words.length) return false;
  for (let i = 0; i < prev.words.length; i += 1) {
    if (prev.words[i]._id !== next.words[i]._id) return false;
    if (prev.words[i].grammaticalCategory !== next.words[i].grammaticalCategory) return false;
  }
  return true;
});
RootTree.displayName = 'RootTree';
