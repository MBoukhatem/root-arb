export type ConstellationNode = {
  id: string;
  letters: string;
  transliteration: string;
  semanticField: string;
  masteryLevel: number;
};

export type ConstellationLink = {
  source: string;
  target: string;
};

export type ConstellationProps = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  onNodeClick?: (id: string) => void;
  className?: string;
};

/** Internal mutable simulation node (d3.forceSimulation writes x/y/vx/vy). */
export type SimNode = ConstellationNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

/** Internal mutable simulation link (d3 replaces id strings with node refs). */
export type SimLink = {
  source: string | SimNode;
  target: string | SimNode;
};
