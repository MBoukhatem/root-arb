import { useMemo } from 'react';
import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy';
import type { RootTreeDatum, RootTreeProps } from './RootTree.types';

export type LayoutMode = 'radial' | 'vertical';

export type LayoutNode = {
  id: string;
  data: RootTreeDatum;
  x: number; // cartesian x in viewBox coords
  y: number; // cartesian y in viewBox coords
  /** Original tree() coords (angle for radial, x for vertical). */
  raw: { x: number; y: number };
  depth: number;
};

export type LayoutLink = {
  source: LayoutNode;
  target: LayoutNode;
  /** SVG path "d" attribute already projected to viewBox coords. */
  d: string;
};

export type RootTreeLayout = {
  nodes: LayoutNode[];
  links: LayoutLink[];
  viewBox: { width: number; height: number };
  mode: LayoutMode;
};

/**
 * Build the d3.hierarchy datum from props. The root sits at the centre and
 * every word becomes a leaf child. Memoization keys on stable scalars so we
 * never recompute on shallow prop changes.
 */
function buildDatum(
  props: Pick<RootTreeProps, 'root' | 'words'>,
  lang: 'fr' | 'en',
): RootTreeDatum {
  return {
    id: '__root__',
    label: props.root.letters,
    transliteration: props.root.transliteration,
    translation: props.root.coreMeaning[lang] ?? props.root.coreMeaning.fr,
    category: 'root',
    children: props.words.map((w) => ({
      id: w._id,
      label: w.arabicWord,
      transliteration: w.transliteration,
      translation: w.translations[lang] ?? w.translations.fr,
      category: w.grammaticalCategory,
      wordId: w._id,
    })),
  };
}

/**
 * Project a polar (angle, radius) point to cartesian coords centred on (cx,cy).
 * angle: d3.tree() returns angle in [0, 2*pi].
 */
function radialPoint(angle: number, radius: number): [number, number] {
  // d3.tree() radial convention: angle measured from +y (top). Rotate -pi/2.
  const a = angle - Math.PI / 2;
  return [Math.cos(a) * radius, Math.sin(a) * radius];
}

function radialLinkPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  cx: number,
  cy: number,
): string {
  // source/target in polar: x=angle, y=radius.
  const a0 = source.x - Math.PI / 2;
  const a1 = target.x - Math.PI / 2;
  const r0 = source.y;
  const r1 = target.y;
  const [sx, sy] = [Math.cos(a0) * r0 + cx, Math.sin(a0) * r0 + cy];
  const [tx, ty] = [Math.cos(a1) * r1 + cx, Math.sin(a1) * r1 + cy];
  // Cubic Bezier with control points along the radial.
  const cr = (r0 + r1) / 2;
  const [c1x, c1y] = [Math.cos(a0) * cr + cx, Math.sin(a0) * cr + cy];
  const [c2x, c2y] = [Math.cos(a1) * cr + cx, Math.sin(a1) * cr + cy];
  return `M${sx},${sy}C${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;
}

function verticalLinkPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
): string {
  const my = (source.y + target.y) / 2;
  return `M${source.x},${source.y}C${source.x},${my} ${target.x},${my} ${target.x},${target.y}`;
}

export function useRootTreeLayout(
  props: Pick<RootTreeProps, 'root' | 'words'>,
  size: { width: number; height: number },
  mode: LayoutMode,
  lang: 'fr' | 'en' = 'fr',
): RootTreeLayout {
  // Stable signature of the words list: ids + categories. Re-derived only when
  // the list shape changes, so the layout memo below stays valid across
  // shallow re-renders.
  const wordsSig = props.words.map((w) => `${w._id}:${w.grammaticalCategory}`).join('|');
  return useMemo<RootTreeLayout>(() => {
    const datum = buildDatum(props, lang);
    const root = hierarchy<RootTreeDatum>(datum);

    const width = Math.max(320, size.width);
    const height = Math.max(280, size.height);

    if (mode === 'radial') {
      const radius = Math.min(width, height) / 2 - 80;
      const layout = tree<RootTreeDatum>()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(a.depth, 1));
      const positioned = layout(root);

      const cx = width / 2;
      const cy = height / 2;

      const nodes: LayoutNode[] = positioned
        .descendants()
        .map((n: HierarchyPointNode<RootTreeDatum>) => {
          const [px, py] = radialPoint(n.x, n.y);
          return {
            id: n.data.id,
            data: n.data,
            x: px + cx,
            y: py + cy,
            raw: { x: n.x, y: n.y },
            depth: n.depth,
          };
        });

      const links: LayoutLink[] = positioned.links().map((l) => ({
        source: nodes.find((nd) => nd.id === l.source.data.id)!,
        target: nodes.find((nd) => nd.id === l.target.data.id)!,
        d: radialLinkPath(
          { x: l.source.x, y: l.source.y },
          { x: l.target.x, y: l.target.y },
          cx,
          cy,
        ),
      }));

      return { nodes, links, viewBox: { width, height }, mode };
    }

    // Vertical (top-down) mode
    const layout = tree<RootTreeDatum>().size([width - 80, height - 120]);
    const positioned = layout(root);

    const nodes: LayoutNode[] = positioned.descendants().map((n) => ({
      id: n.data.id,
      data: n.data,
      x: n.x + 40,
      y: n.y + 60,
      raw: { x: n.x, y: n.y },
      depth: n.depth,
    }));

    const links: LayoutLink[] = positioned.links().map((l) => {
      const s = nodes.find((nd) => nd.id === l.source.data.id)!;
      const t = nodes.find((nd) => nd.id === l.target.data.id)!;
      return { source: s, target: t, d: verticalLinkPath(s, t) };
    });

    return { nodes, links, viewBox: { width, height }, mode };
    // We key only on the scalars that actually affect geometry. The
    // pre-computed `wordsSig` is the cheap signature of the words list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.root.letters,
    props.root.transliteration,
    props.root.coreMeaning.fr,
    props.root.coreMeaning.en,
    wordsSig,
    size.width,
    size.height,
    mode,
    lang,
  ]);
}
