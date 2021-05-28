import Graph from "graphology";
import { Driver } from "neo4j-driver";
import { CypherToGraphOpts } from "./types";
/**
 * Create a graphology graph based on the result of a cypher query.
 *
 * @param neo4j Object with the neo4j's driver and optionally the database name
 * @param cypher Query to executed for the graph creation
 * @param params Query's parameters
 * @param opts Allow you to defined the graphology attribut mapping for neo4j's ids (default @id), node's labels (default @labels) & relationship's type (default @type).
 * @returns A graphology instance
 */
export declare function cypherToGraph(neo4j: {
    driver: Driver;
    database?: string;
}, cypher: string, params?: {
    [param: string]: unknown;
}, opts?: CypherToGraphOpts): Promise<Graph>;
