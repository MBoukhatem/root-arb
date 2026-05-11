import { useEffect, useRef } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { ConstellationLink, ConstellationNode, SimLink, SimNode } from './Constellation.types';

type Params = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  width: number;
  height: number;
  onTick: (nodes: SimNode[], links: SimLink[]) => void;
  onReady?: (nodes: SimNode[], links: SimLink[], sim: Simulation<SimNode, SimLink>) => void;
};

/**
 * Owns a `d3-force` simulation. Clones input nodes/links to avoid mutating
 * react-query cache (d3 replaces link.source/target string ids with node
 * references after the first tick). Stops + cleans up on unmount.
 */
export function useForceSimulation({ nodes, links, width, height, onTick, onReady }: Params) {
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const dataRef = useRef<{ nodes: SimNode[]; links: SimLink[] }>({ nodes: [], links: [] });

  useEffect(() => {
    // Defensive deep-ish clone: spread each node + link so d3 mutations stay local.
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = links.map((l) => ({ source: l.source, target: l.target }));

    dataRef.current = { nodes: simNodes, links: simLinks };

    const sim = forceSimulation<SimNode>(simNodes)
      .force('charge', forceManyBody<SimNode>().strength(-120))
      .force(
        'link',
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(
          simLinks as unknown as SimulationLinkDatum<SimNode>[],
        )
          .id((d) => d.id)
          .distance(80)
          .strength(0.6),
      )
      .force('center', forceCenter(width / 2, height / 2))
      .force(
        'collide',
        forceCollide<SimNode>().radius((d) => 8 + d.masteryLevel * 3 + 4),
      )
      .alphaDecay(0.05);

    sim.on('tick', () => {
      onTick(dataRef.current.nodes, dataRef.current.links);
    });

    simRef.current = sim;

    if (onReady) onReady(simNodes, simLinks, sim);

    return () => {
      sim.stop();
      sim.on('tick', null);
      simRef.current = null;
    };
    // We intentionally key on data length + size; deep changes will warrant a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, links.length, width, height]);

  return simRef;
}

/** Type re-export to keep callers honest on what d3 mutates. */
export type { SimulationNodeDatum };
