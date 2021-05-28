import Graph from "graphology";
import { Driver } from "neo4j-driver";
import { CypherToGraphOpts } from "./types";
/**
 * Create a graphology graph based on the cypher projection queries.
 *
 * @param neo4j Object with the neo4j's driver and optionally the database name
 * @param cypherNodes The query to executed to get nodes. The query must return an `id` field and other fiels with be added as node's property
 * @param cypherRelationships The query to executed to get edges. The query must returns a field `source` and `target`,
 * @param params Query parameters that will be passed to both queries
 * @param opts Allow you to defined the graphology attribut mapping for neo4j's ids (default @id), node's labels (default @labels) & relationship's type (default @type).
 * @returns A graphology instance
 */
export declare function cypherProjectionToGraph(neo4j: {
    driver: Driver;
    database?: string;
}, cypherNodes: string, cypherRelationships: string, params?: {
    [param: string]: unknown;
}, opts?: CypherToGraphOpts): Promise<Graph>;
