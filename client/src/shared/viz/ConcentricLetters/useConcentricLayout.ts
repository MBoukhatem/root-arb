import { useMemo } from 'react';
import { scaleLog, scaleLinear, min, max } from 'd3';
import type { CooccurrenceData, ConcentricLayout, RingNode, CenterNode, LayoutLink } from './types';
import { linkStrokeWidth } from './colors';

/**
 * Fixed square coordinate space. The SVG always uses viewBox="0 0 1000 1000"
 * and the container constrains itself to a square, so circles stay circular
 * regardless of viewport size.
 */
export const VIEWBOX_SIZE = 1000;
const CENTER = VIEWBOX_SIZE / 2; // 500
const CENTER_FOOTPRINT = 95; // px (center disc radius + breathing room)

// Ring radii are computed from the square edge so they always fit.
// Order: ring 0 (closest = most frequent), ring 1, ring 2 (farthest = rare).
const RING_FRACTIONS = [0.42, 0.62, 0.82] as const;

const NODE_RADIUS_RANGE: [number, number] = [32, 56];

/**
 * `useConcentricLayout` — pure deterministic D3-math layout hook.
 *
 * Pattern: React owns DOM, D3 owns math. This hook returns stable position
 * data; the component renders SVG elements. No D3 DOM manipulation.
 *
 * Coordinates are in a fixed 1000×1000 viewBox — the SVG element scales
 * uniformly to its (square) container. This guarantees:
 *   • cercles toujours circulaires (pas d'aspect-ratio mismatch)
 *   • lettres ne se chevauchent pas (positions statiques deterministes)
 *
 * Ring assignment:
 *   - neighbours sorted descending by count
 *   - ≤ 8 neighbours → 2 rings (split en deux moitiés)
 *   - sinon → 3 rings (tertiles)
 *
 * RTL inverse le sens angulaire pour cohérence avec la lecture droite→gauche.
 */
export function useConcentricLayout(
  data: CooccurrenceData | null,
  _size: { width: number; height: number }, // kept for API compat, unused
  isRTL: boolean = false,
): ConcentricLayout {
  void _size;
  return useMemo(() => {
    const cx = CENTER;
    const cy = CENTER;
    const maxR = CENTER - CENTER_FOOTPRINT; // 405

    const centerNode: CenterNode = { letter: data?.letter ?? '', x: cx, y: cy };

    if (!data || data.cooccurrences.length === 0) {
      return { centerNode, ringNodes: [], links: [] };
    }

    const neighbours = [...data.cooccurrences].sort((a, b) => b.count - a.count);
    const n = neighbours.length;

    const useRings = n <= 8 ? 2 : 3;

    const ringOf = (i: number): 0 | 1 | 2 => {
      if (useRings === 2) {
        const half = Math.ceil(n / 2);
        return i < half ? 0 : 1;
      }
      const third = Math.ceil(n / 3);
      if (i < third) return 0;
      if (i < 2 * third) return 1;
      return 2;
    };

    const counts = neighbours.map((nb) => nb.count);
    const minC = min(counts) ?? 1;
    const maxC = max(counts) ?? 1;

    const radiusScale =
      minC === maxC
        ? () => (NODE_RADIUS_RANGE[0] + NODE_RADIUS_RANGE[1]) / 2
        : scaleLog<number>()
            .domain([Math.max(1, minC), maxC])
            .range(NODE_RADIUS_RANGE)
            .clamp(true);

    const normScale =
      minC === maxC ? () => 1 : scaleLinear().domain([minC, maxC]).range([0, 1]).clamp(true);

    const byRing = new Map<0 | 1 | 2, Array<(typeof neighbours)[number] & { idx: number }>>([
      [0, []],
      [1, []],
      [2, []],
    ]);
    neighbours.forEach((nb, i) => {
      byRing.get(ringOf(i))!.push({ ...nb, idx: i });
    });

    const ringRadii = RING_FRACTIONS.map((f) => f * maxR) as [number, number, number];

    const ringNodes: RingNode[] = [];
    const links: LayoutLink[] = [];

    for (const [ring, group] of byRing.entries()) {
      if (group.length === 0) continue;
      const r = ringRadii[ring as 0 | 1 | 2];
      const count = group.length;
      const step = (2 * Math.PI) / count;
      // Start at 12 o'clock (-π/2). RTL inverse le sens.
      const direction = isRTL ? -1 : 1;

      group.forEach((nb, i) => {
        const angle = -Math.PI / 2 + i * step * direction;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const radius = radiusScale(nb.count);
        const normFreq = normScale(nb.count);

        ringNodes.push({
          letter: nb.letter,
          count: nb.count,
          sharedRootIds: nb.sharedRootIds,
          ring: ring as 0 | 1 | 2,
          x,
          y,
          radius,
          normFreq,
        });

        links.push({
          x1: cx,
          y1: cy,
          x2: x,
          y2: y,
          strokeWidth: linkStrokeWidth(normFreq),
          normFreq,
        });
      });
    }

    return { centerNode, ringNodes, links };
  }, [data, isRTL]);
}

// Kept exported for layout tests
export const RING_THRESHOLDS_2 = [0.5];
