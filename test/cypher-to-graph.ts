import * as assert from "assert";
import * as neo4j from "neo4j-driver";
import { cypherToGraph } from "../src/cypher-to-graph";

// create the neo4j driver
let driver: neo4j.Driver;

describe("Testing Cypher to graph", function() {
  before(() => {
    driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
  });
  after(() => {
    if (driver) driver.close();
  });

  it("cypher that returns nodes should work", async () => {
    const graph = await cypherToGraph({ driver }, "MATCH (n) RETURN n");

    assert.equal(graph.order, 171);
    assert.equal(graph.size, 0);
    for (const [nodeKey, attributes] of graph.nodeEntries()) {
      assert.equal(attributes["@id"], nodeKey);
      assert.ok(attributes["@labels"]);
      assert.ok(attributes["@labels"][0]);
    }
  });

  it("cypher that returns array of nodes should work", async () => {
    const graph = await cypherToGraph({ driver }, "MATCH (n) RETURN collect(n)");

    assert.equal(graph.order, 171);
    assert.equal(graph.size, 0);
    for (const [nodeKey, attributes] of graph.nodeEntries()) {
      assert.equal(attributes["@id"], nodeKey);
      assert.ok(attributes["@labels"]);
      assert.ok(attributes["@labels"][0]);
    }
  });

  it("cypher that returns nodes & edges should work", async () => {
    const graph = await cypherToGraph(
      { driver },
      `MATCH (m:Movie {title:"The Matrix"})<-[r:ACTED_IN]-(p:Person) RETURN m,r,p`,
    );

    assert.equal(graph.order, 6);
    assert.equal(graph.size, 5);
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

  it("cypher that returns path should work", async () => {
    const graph = await cypherToGraph(
      { driver },
      `MATCH p=(:Movie {title:"The Matrix"})<-[:ACTED_IN]-(:Person) RETURN p`,
    );

    assert.equal(graph.order, 6);
    assert.equal(graph.size, 5);
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

  it("cypher that returns array of path should work", async () => {
    const graph = await cypherToGraph(
      { driver },
      `MATCH p=(:Movie {title:"The Matrix"})<-[:ACTED_IN]-(:Person) RETURN collect(p)`,
    );

    assert.equal(graph.order, 6);
    assert.equal(graph.size, 5);
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
    const graph = await cypherToGraph(
      { driver },
      `MATCH p=(:Movie {title:"The Matrix"})<-[:ACTED_IN]-(:Person) RETURN p`,
      {},
      { id: "_id", labels: "_labels", type: "_type" },
    );

    assert.equal(graph.order, 6);
    assert.equal(graph.size, 5);
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
