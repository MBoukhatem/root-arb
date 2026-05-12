import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { drag, type D3DragEvent } from 'd3-drag';
import { zoom, zoomIdentity, type D3ZoomEvent } from 'd3-zoom';
import type { Simulation } from 'd3-force';
import clsx from 'clsx';
import { useResizeObserver } from '../shared/useResizeObserver';
import { useForceSimulation } from './useForceSimulation';
import { colorForSemanticField } from './semanticFieldColors';
import type { ConstellationProps, SimLink, SimNode } from './Constellation.types';

const SVG_NODE_THRESHOLD = 50;

type Tooltip = { node: SimNode; clientX: number; clientY: number } | null;

function radiusFor(node: SimNode): number {
  return 5 + node.masteryLevel * 3;
}

/* --------------------------------------------------------------------------
 * SVG renderer (<=50 nodes). D3 owns DOM: enter/update/exit inside useEffect.
 * ------------------------------------------------------------------------ */
function ConstellationSvg({
  nodes,
  links,
  size,
  onNodeClick,
  setTooltip,
}: {
  nodes: ConstellationProps['nodes'];
  links: ConstellationProps['links'];
  size: { width: number; height: number };
  onNodeClick?: (id: string) => void;
  setTooltip: (t: Tooltip) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  const handleTick = useCallback(() => {
    const g = gRef.current;
    if (!g) return;
    const root = select(g);

    root
      .select<SVGGElement>('g.links')
      .selectAll<SVGLineElement, SimLink>('line')
      .attr('x1', (d) => (typeof d.source === 'object' ? (d.source.x ?? 0) : 0))
      .attr('y1', (d) => (typeof d.source === 'object' ? (d.source.y ?? 0) : 0))
      .attr('x2', (d) => (typeof d.target === 'object' ? (d.target.x ?? 0) : 0))
      .attr('y2', (d) => (typeof d.target === 'object' ? (d.target.y ?? 0) : 0));

    root
      .select<SVGGElement>('g.nodes')
      .selectAll<SVGGElement, SimNode>('g.node')
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
  }, []);

  const handleReady = useCallback(
    (simNodes: SimNode[], simLinks: SimLink[], sim: Simulation<SimNode, SimLink>) => {
      const svg = svgRef.current;
      const g = gRef.current;
      if (!svg || !g) return;

      const root = select(g);

      // Links
      const linkSel = root
        .select<SVGGElement>('g.links')
        .selectAll<SVGLineElement, SimLink>('line')
        .data(simLinks);
      linkSel.exit().remove();
      linkSel
        .enter()
        .append('line')
        .attr('stroke', 'var(--text-muted)')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1);

      // Nodes
      const nodeSel = root
        .select<SVGGElement>('g.nodes')
        .selectAll<SVGGElement, SimNode>('g.node')
        .data(simNodes, (d) => d.id);
      nodeSel.exit().remove();
      const nodeEnter = nodeSel
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'pointer');
      nodeEnter
        .append('circle')
        .attr('r', (d) => radiusFor(d))
        .attr('fill', (d) => colorForSemanticField(d.semanticField))
        .attr('stroke', 'var(--bg-base)')
        .attr('stroke-width', 1.5);
      nodeEnter
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', (d) => -radiusFor(d) - 6)
        .attr('font-size', 11)
        .attr('font-family', 'var(--font-arabic-title)')
        .attr('fill', 'var(--text-primary)')
        .attr('lang', 'ar')
        .text((d) => d.letters);

      const merged = root.select<SVGGElement>('g.nodes').selectAll<SVGGElement, SimNode>('g.node');

      // Drag — activate on all pointer types (touch-action:none handles scroll prevention)
      const dragBehavior = drag<SVGGElement, SimNode>()
        .on('start', (event: D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x ?? 0;
          d.fy = d.y ?? 0;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
      merged.call(dragBehavior);

      // Mouse + click handlers
      merged
        .on('mouseenter', (event: MouseEvent, d) => {
          setTooltip({ node: d, clientX: event.clientX, clientY: event.clientY });
        })
        .on('mousemove', (event: MouseEvent, d) => {
          setTooltip({ node: d, clientX: event.clientX, clientY: event.clientY });
        })
        .on('mouseleave', () => setTooltip(null))
        .on('click', (_event: MouseEvent, d) => {
          if (onNodeClick) onNodeClick(d.id);
        });

      // Zoom + pan — init to identity to prevent drift on remount (#fix-1)
      const zoomBehavior = zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          // Guard: skip programmatic resets to avoid loops (#fix-16)
          if (!event.sourceEvent) return;
          root.attr('transform', event.transform.toString());
        });
      const svgSel = select(svg);
      svgSel.call(zoomBehavior);
      // Initialise transform so remount doesn't drift
      svgSel.call(zoomBehavior.transform, zoomIdentity);
    },
    [onNodeClick, setTooltip],
  );

  useForceSimulation({
    nodes,
    links,
    width: size.width,
    height: size.height,
    onTick: handleTick,
    onReady: handleReady,
  });

  // Cleanup zoom/handlers when svg unmounts
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    return () => {
      if (g) {
        const root = select(g);
        root
          .select('g.nodes')
          .selectAll('g.node')
          .on('mouseenter', null)
          .on('mousemove', null)
          .on('mouseleave', null)
          .on('click', null);
      }
      if (svg) {
        select(svg).on('.zoom', null);
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      role="application"
      aria-label="Constellation des racines"
      width="100%"
      height={size.height}
      viewBox={`0 0 ${Math.max(1, size.width)} ${Math.max(1, size.height)}`}
      style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
    >
      <g ref={gRef}>
        <g className="links" />
        <g className="nodes" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------------------
 * Canvas renderer (>50 nodes). Same simulation, but draw to <canvas>.
 * ------------------------------------------------------------------------ */
function ConstellationCanvas({
  nodes,
  links,
  size,
  onNodeClick,
  setTooltip,
}: {
  nodes: ConstellationProps['nodes'];
  links: ConstellationProps['links'];
  size: { width: number; height: number };
  onNodeClick?: (id: string) => void;
  setTooltip: (t: Tooltip) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    const tr = transformRef.current;
    ctx.translate(tr.x, tr.y);
    ctx.scale(tr.k, tr.k);

    // Links
    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.lineWidth = 1;
    for (const l of simLinksRef.current) {
      const s = l.source;
      const t = l.target;
      if (typeof s !== 'object' || typeof t !== 'object') continue;
      ctx.beginPath();
      ctx.moveTo(s.x ?? 0, s.y ?? 0);
      ctx.lineTo(t.x ?? 0, t.y ?? 0);
      ctx.stroke();
    }

    // Nodes
    for (const n of simNodesRef.current) {
      ctx.fillStyle = colorForSemanticField(n.semanticField);
      ctx.beginPath();
      ctx.arc(n.x ?? 0, n.y ?? 0, radiusFor(n), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, [size.width, size.height]);

  const handleTick = useCallback(
    (simNodes: SimNode[], simLinks: SimLink[]) => {
      simNodesRef.current = simNodes;
      simLinksRef.current = simLinks;
      draw();
    },
    [draw],
  );

  useForceSimulation({
    nodes,
    links,
    width: size.width,
    height: size.height,
    onTick: handleTick,
  });

  // DPR-aware sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, size.width * dpr);
    canvas.height = Math.max(1, size.height * dpr);
    draw();
  }, [size.width, size.height, draw]);

  // Pointer interactions: hit-detect with a simple radial check.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function pick(clientX: number, clientY: number): SimNode | null {
      const rect = canvas!.getBoundingClientRect();
      const tr = transformRef.current;
      const x = (clientX - rect.left - tr.x) / tr.k;
      const y = (clientY - rect.top - tr.y) / tr.k;
      for (const n of simNodesRef.current) {
        const r = radiusFor(n);
        const dx = (n.x ?? 0) - x;
        const dy = (n.y ?? 0) - y;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    }

    const onMove = (e: MouseEvent) => {
      const hit = pick(e.clientX, e.clientY);
      if (hit) setTooltip({ node: hit, clientX: e.clientX, clientY: e.clientY });
      else setTooltip(null);
    };
    const onLeave = () => setTooltip(null);
    const onClick = (e: MouseEvent) => {
      const hit = pick(e.clientX, e.clientY);
      if (hit && onNodeClick) onNodeClick(hit.id);
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);

    // Zoom + pan (canvas) — init to identity to prevent drift on remount (#fix-1)
    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        transformRef.current = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
        draw();
      });
    const canvasSel = select(canvas);
    canvasSel.call(zoomBehavior);
    // Initialise transform so remount doesn't drift
    canvasSel.call(zoomBehavior.transform, zoomIdentity);

    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      select(canvas).on('.zoom', null);
    };
  }, [onNodeClick, setTooltip, draw]);

  return (
    <canvas
      ref={canvasRef}
      role="application"
      aria-label="Constellation des racines"
      style={{
        display: 'block',
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}

/* --------------------------------------------------------------------------
 * Public component
 * ------------------------------------------------------------------------ */
function ConstellationImpl({ nodes, links, onNodeClick, className }: ConstellationProps) {
  const { ref, size } = useResizeObserver<HTMLDivElement>({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const useCanvas = nodes.length > SVG_NODE_THRESHOLD;
  const effectiveSize = {
    width: size.width || 800,
    height: size.height || 600,
  };

  return (
    <div ref={ref} className={clsx('relative w-full', className)} style={{ minHeight: '60vh' }}>
      {useCanvas ? (
        <ConstellationCanvas
          nodes={nodes}
          links={links}
          size={effectiveSize}
          onNodeClick={onNodeClick}
          setTooltip={setTooltip}
        />
      ) : (
        <ConstellationSvg
          nodes={nodes}
          links={links}
          size={effectiveSize}
          onNodeClick={onNodeClick}
          setTooltip={setTooltip}
        />
      )}

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-full rounded-md border border-(--border) bg-(--bg-card) px-3 py-2 text-xs text-(--text-primary) shadow-md"
          style={{ left: tooltip.clientX, top: tooltip.clientY - 12 }}
        >
          <div className="font-arabic-title text-base" lang="ar" dir="rtl">
            {tooltip.node.letters}
          </div>
          {tooltip.node.transliteration ? (
            <div className="italic text-(--text-secondary)">{tooltip.node.transliteration}</div>
          ) : null}
          <div>Mastery: {tooltip.node.masteryLevel}</div>
        </div>
      )}

      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.letters} — {n.transliteration} — {n.semanticField} — mastery {n.masteryLevel}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Constellation = memo(ConstellationImpl, (prev, next) => {
  if (prev.onNodeClick !== next.onNodeClick) return false;
  if (prev.className !== next.className) return false;
  if (prev.nodes.length !== next.nodes.length) return false;
  if (prev.links.length !== next.links.length) return false;
  for (let i = 0; i < prev.nodes.length; i += 1) {
    if (prev.nodes[i].id !== next.nodes[i].id) return false;
  }
  return true;
});
Constellation.displayName = 'Constellation';
