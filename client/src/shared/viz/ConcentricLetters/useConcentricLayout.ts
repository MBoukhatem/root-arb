import { useMemo } from 'react';
import { scaleLog, scaleLinear, min, max } from 'd3';
import type { CooccurrenceData, ConcentricLayout, RingNode, CenterNode, LayoutLink } from './types';
import { linkStrokeWidth } from './colors';

const RING_RADII = [150, 250, 350] as const; // px for ring 0, 1, 2
const NODE_RADIUS_RANGE: [number, number] = [20, 36];
const RING_THRESHOLDS_2 = [0.5]; // split point for 2-ring mode
const CENTER_FOOTPRINT = 88; // px — from spec §3

/**
 * `useConcentricLayout` — pure deterministic D3-math layout hook.
 *
 * Pattern: React owns DOM, D3 owns math. This hook returns stable position
 * data; the component renders SVG elements. No D3 DOM manipulation.
 *
 * Ring assignment:
 *   - neighbours sorted descending by count
 *   - top third → ring 0, middle third → ring 1, bottom third → ring 2
 *   - if all ≤ 8 neighbours: use 2 rings only
 *   - if ≤ 12 per ring: use spec RING_RADII; else ring2 expands to 350px
 *
 * RTL direction is handled in the page: the SVG container gets `dir="ltr"`
 * so math stays consistent; only label text gets `dir="rtl"`.
 */
export function useConcentricLayout(
  data: CooccurrenceData | null,
  size: { width: number; height: number },
  isRTL: boolean = false,
): ConcentricLayout {
  return useMemo(() => {
    const cx = size.width / 2;
    const cy = size.height / 2;

    const centerNode: CenterNode = { letter: data?.letter ?? '', x: cx, y: cy };

    if (!data || data.cooccurrences.length === 0) {
      return { centerNode, ringNodes: [], links: [] };
    }

    const neighbours = [...data.cooccurrences].sort((a, b) => b.count - a.count);
    const n = neighbours.length;

    // --- Decide ring count ---
    const useRings = n <= 8 ? 2 : 3;

    // --- Assign ring index by tertile (or half) ---
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

    // --- Scale: log on count for node radii ---
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

    // Group by ring to compute angular distribution per ring
    const byRing = new Map<0 | 1 | 2, Array<(typeof neighbours)[number] & { idx: number }>>([
      [0, []],
      [1, []],
      [2, []],
    ]);
    neighbours.forEach((nb, i) => {
      const ring = ringOf(i);
      byRing.get(ring)!.push({ ...nb, idx: i });
    });

    // Radius expansion: if a ring has >12 items, push ring2 out further
    const ringsRadii = [...RING_RADII] as [number, number, number];
    const maxW = Math.min(cx, cy) - CENTER_FOOTPRINT;
    ringsRadii[0] = Math.min(RING_RADII[0], maxW * 0.45);
    ringsRadii[1] = Math.min(RING_RADII[1], maxW * 0.72);
    ringsRadii[2] = Math.min(RING_RADII[2], maxW * 0.97);

    const ringNodes: RingNode[] = [];
    const links: LayoutLink[] = [];

    for (const [ring, group] of byRing.entries()) {
      if (group.length === 0) continue;
      const r = ringsRadii[ring as 0 | 1 | 2];
      const step = (2 * Math.PI) / group.length;
      // Start at 12 o'clock (-π/2). RTL reverses angular direction.
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
  }, [data, size.width, size.height, isRTL]);
}

// Also export the threshold so tests can import it
export { RING_THRESHOLDS_2 };
