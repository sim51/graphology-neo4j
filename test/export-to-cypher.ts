import * as assert from "assert";
import * as neo4j from "neo4j-driver";
import { cypherToGraph } from "../src/cypher-to-graph";
import { exportToCypher } from "../src/export-to-cypher";

// create the neo4j driver
let driver: neo4j.Driver;

describe("Testing graph to cypher", function() {
  before(() => {
    driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
  });
  after(() => {
    if (driver) driver.close();
  });

  it("should work", async () => {
    const graph = await cypherToGraph({ driver }, "MATCH (n)-[r]->(m) RETURN n,r,m");
    const cypher = exportToCypher(graph);
    console.log(cypher);

    const session: neo4j.Session = driver.session({
      defaultAccessMode: neo4j.session.WRITE,
    });
    try {
      await session.run(cypher);
      assert.ok(true);
    } catch (e) {
      console.log(e);
      assert.fail();
    } finally {
      session.close();
    }
  });
});
