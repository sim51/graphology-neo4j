import * as assert from "assert";
import * as neo4j from "neo4j-driver";
import { cypherProjectionToGraph } from "../src/cypher-projection-to-graph";

// create the neo4j driver
let driver: neo4j.Driver;

describe("Testing Cypher projection to graph", function() {
  before(() => {
    driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
  });
  after(() => {
    if (driver) driver.close();
  });

  it("cypher projection should work", async () => {
    const graph = await cypherProjectionToGraph(
      { driver },
      "MATCH (p:Person) RETURN id(p) AS id, labels(p) AS labels, p.name AS name",
      "MATCH (p1:Person)-[:ACTED_IN]->(:Movie)<-[:ACTED_IN]-(p2:Person) WHERE id(p1) < id(p2) RETURN id(p1) AS source, id(p2) AS target, count(*) AS weight, 'COLLEAGUE' AS type",
    );

    assert.equal(graph.order, 133);
    assert.equal(graph.size, 362);
    for (const [nodeKey, attributes] of graph.nodeEntries()) {
      assert.equal(attributes["@id"], nodeKey);
      assert.ok(attributes["@labels"]);
      assert.ok(attributes["@labels"][0]);
    }
    for (const [edgeKey, attributes] of graph.edgeEntries()) {
      assert.equal(attributes["@id"], edgeKey);
      assert.ok(attributes["@type"]);
    }
  });

  it("specifying options should work", async () => {
    const graph = await cypherProjectionToGraph(
      { driver },
      "MATCH (p:Person) RETURN id(p) AS id, labels(p) AS labels, p.name AS name",
      "MATCH (p1:Person)-[:ACTED_IN]->(:Movie)<-[:ACTED_IN]-(p2:Person) WHERE id(p1) < id(p2) RETURN id(p1) AS source, id(p2) AS target, count(*) AS weight, 'COLLEAGUE' AS type",
      {},
      { id: "_id", labels: "_labels", type: "_type" },
    );

    assert.equal(graph.order, 133);
    assert.equal(graph.size, 362);
    for (const [nodeKey, attributes] of graph.nodeEntries()) {
      assert.equal(attributes["_id"], nodeKey);
      assert.ok(attributes["_labels"]);
      assert.ok(attributes["_labels"][0]);
    }
    for (const [edgeKey, attributes] of graph.edgeEntries()) {
      assert.equal(attributes["_id"], edgeKey);
      assert.ok(attributes["_type"]);
    }
  });
});
