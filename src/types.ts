interface BaseElement {
  [key: string]: unknown;
}

export type Vertex = BaseElement;

export type Edge = BaseElement;

export interface CypherToGraphOpts {
  id: string;
  labels: string;
  type: string;
}
