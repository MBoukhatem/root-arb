import { useMemo } from 'react';
import type { CooccurrenceData, ConcentricLayout, RingNode, CenterNode, LayoutLink } from './types';
import { linkStrokeWidth } from './colors';

/**
 * Fixed square coordinate space. The SVG always uses viewBox="0 0 1000 1000"
 * and the container constrains itself to a square, so circles stay circular
 * regardless of viewport size.
 */
export const VIEWBOX_SIZE = 1000;
const CENTER = VIEWBOX_SIZE / 2; // 500
const CENTER_FOOTPRINT = 95;

/**
 * Single ring layout — all peripheral letters share the same ring at a fixed
 * fraction of the viewport. No frequency-based intensity or sizing : every
 * peripheral letter has the same colour, same circle radius, evenly spaced
 * around the centre. The user requested this simpler reading (no gradation).
 */
const RING_FRACTION = 0.68;
const NODE_RADIUS = 44;

/**
 * `useConcentricLayout` — single-ring radial layout.
 *
 * All peripheral letters are placed evenly on ONE circle around the centre
 * (no rings/tertiles, no frequency-based intensity, no log radius scale).
 * Each letter shares the same fill colour and the same circle radius — the
 * encoding is purely positional. User explicitly requested this simpler
 * reading.
 *
 * Coordinates are in a fixed 1000×1000 viewBox so circles stay circular
 * regardless of viewport. RTL inverse le sens angulaire.
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

    const r = RING_FRACTION * maxR;
    const step = (2 * Math.PI) / n;
    const direction = isRTL ? -1 : 1;

    const ringNodes: RingNode[] = [];
    const links: LayoutLink[] = [];

    neighbours.forEach((nb, i) => {
      // Start at 12 o'clock (-π/2). Even spacing on a single ring.
      const angle = -Math.PI / 2 + i * step * direction;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      ringNodes.push({
        letter: nb.letter,
        count: nb.count,
        sharedRootIds: nb.sharedRootIds,
        ring: 0,
        x,
        y,
        radius: NODE_RADIUS,
        normFreq: 1,
      });

      links.push({
        x1: cx,
        y1: cy,
        x2: x,
        y2: y,
        strokeWidth: linkStrokeWidth(1),
        normFreq: 1,
      });
    });

    return { centerNode, ringNodes, links };
  }, [data, isRTL]);
}

// Kept exported for layout tests
export const RING_THRESHOLDS_2 = [0.5];
