#  Graphology Neo4j [![CI](https://github.com/sim51/graphology-neo4j/actions/workflows/test.yml/badge.svg)](https://github.com/sim51/graphology-neo4j/actions/workflows/test.yml)

Create a graphology Graph from cypher queries

## Usage

This library doesn’t include the Neo4j driver library as well as the Graphology one.
They are peer dependencies, so you need to install them by yourself.

    npm install neo4j-driver graphology graphology-neo4j

### Translate a cypher query to a graph

You can create a graph directly from a cypher query.
The method `cypherToGraph` will parse the whole result to find Neo4j nodes and relationships for building the graph.

This is the definition of this method :

    /**
     * Create a graphology graph based on the result of a cypher query.
     *
     * @param neo4j Object with the neo4j's driver and optionally the database name
     * @param cypher Query to executed for the graph creation
     * @param params Query's parameters
     * @param opts Allow you to defined the graphology attribut mapping for neo4j's ids (default @id), node's labels (default @labels) & relationship's type (default @type).
     * @returns A graphology instance
     */
    export function cypherToGraph(
      neo4j: { driver: Driver; database?: string },
      cypher: string,
      params: { [param: string]: unknown } = {},
      opts: CypherToGraphOpts = { id: "@id", labels: "@labels", type: "@type" },
    ): Promise<Graph>;

Example:

``` typescript
import * as neo4j from "neo4j-driver";
import Graph from "graphology";
import { cypherToGraph } from "graphology-neo4j";

const driver: neo4j.Driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
const graph: Graph = await cypherToGraph({ driver }, "MATCH (n)-[r]->(m) RETURN n,r,m");
```

<div class="note">
Your cypher query must returned `Node`, `Relationship`, `Path`, and Arrays of those.
</div>

### Cypher graph projection

You can create a graph from a cypher projection as defined
[here](https://neo4j.com/docs/graph-algorithms/current/projected-graph-model/cypher-projection/),
with the help of the method `cypherProjectionToGraph` .

This is the definition of this method :

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
    ): Promise<Graph>

Example:

``` typescript
import * as neo4j from "neo4j-driver";
import Graph from "graphology";
import { cypherProjectionToGraph } from "graphology-neo4j";

const driver: neo4j.Driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
const graph = await cypherProjectionToGraph(
  { driver },
  "MATCH (p:Person) RETURN id(p) AS id, labels(p) AS labels, p.name AS name",
  "MATCH (p1:Person)-[:ACTED_IN]->(:Movie)<-[:ACTED_IN]-(p2:Person) WHERE id(p1) < id(p2) RETURN id(p1) AS source, id(p2) AS target, count(*) AS weight, 'COLLEAGUE' AS type",
  {},
  { id: "_id", labels: "_labels", type: "_type" },
);
```

## The created Graph

The created graph is a multi directed graph, where self-loop are allowed (it’s like in Neo4j).
But in Graphology the notion of `label` for nodes and `type` for relationships don’t exist.
That’s why there is the `CypherToGraphOpts` object where you can define on which property those notions will be saved.

-   Graphology and Neo4j id are the same, but they are also stored on nodes and edges in the property `@id`.

-   Neo4j node’s labels are stored in the property `@labels`

-   Neo4j edge’s type is stored in the property `@type`

## Development

To run the tests you need to have a local Neo4j server with Movie database and the password set to `admin`
