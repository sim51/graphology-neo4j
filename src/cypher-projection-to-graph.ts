import Graph from "graphology";
import { session, Driver, Neo4jError, Record, Session } from "neo4j-driver";
import { Vertex, Edge, CypherToGraphOpts } from "./types";

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
export async function cypherProjectionToGraph(
  neo4j: { driver: Driver; database?: string },
  cypherNodes: string,
  cypherRelationships: string,
  params: { [param: string]: unknown } = {},
  opts: CypherToGraphOpts = { id: "@id", labels: "@labels", type: "@type" },
): Promise<Graph> {
  // Init the graph
  const graph = new Graph({
    multi: true,
    type: "directed",
    allowSelfLoops: true,
  });

  // Create the session
  const neoSession: Session = neo4j.driver.session({
    defaultAccessMode: session.READ,
    database: neo4j.database,
  });

  // Load nodes
  await new Promise<void>((resolveNodes, rejectNodes) => {
    neoSession.run(cypherNodes, params).subscribe({
      onNext: (record: Record) => {
        if (!record.has("id")) rejectNodes(new Error("Node's query must return an `id` field"));
        const { id, labels, ...props } = record.toObject();
        const node: Vertex = { ...props, [opts.id]: id, [opts.labels]: labels || [] };
        graph.mergeNode(id, node);
      },
      onCompleted: () => {
        resolveNodes();
      },
      onError: (error: Neo4jError) => {
        neoSession.close();
        rejectNodes(error);
      },
    });
  });

  // Load relationship
  await new Promise<void>((resolveEdges, rejectEdges) => {
    neoSession.run(cypherRelationships, params).subscribe({
      onNext: (record: Record) => {
        if (!record.has("source") || !record.has("target"))
          rejectEdges(new Error("Relationship's query must return an `source` & `target` field"));
        const { source, target, id, type, ...props } = record.toObject();
        const relId = id || `${source}->${target}`;
        const rel: Edge = { ...props, [opts.id]: relId, [opts.type]: type || "" };
        graph.mergeEdgeWithKey(relId, source, target, rel);
      },
      onCompleted: () => {
        neoSession.close();
        resolveEdges();
      },
      onError: (error: Neo4jError) => {
        neoSession.close();
        rejectEdges(error);
      },
    });
  });

  // return the computed graph
  return graph;
}
