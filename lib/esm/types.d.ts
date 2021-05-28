interface BaseElement {
    [key: string]: unknown;
}
export declare type Vertex = BaseElement;
export declare type Edge = BaseElement;
export interface CypherToGraphOpts {
    id: string;
    labels: string;
    type: string;
}
export {};
