import Graph from "graphology";
import { CypherToGraphOpts } from "./types";

/**
 * Create a cypher "create" script of the graph instance.
 *
 * @param graph A graphology instance
 * @param opts Allow you to defined the graphology attribut mapping for neo4j's ids (default @id), node's labels (default @labels) & relationship's type (default @type).
 * @returns A graphology instance
 */
export function exportToCypher(
  graph: Graph,
  opts: CypherToGraphOpts = { id: "@id", labels: "@labels", type: "@type" },
): string {
  let cypher = "";

  // Using the iterator
  for (const [node, attributes] of graph.nodeEntries()) {
    if (attributes[opts.labels])
      cypher += `CREATE (\`n_${node}\`:\`${attributes[opts.labels].join("`:`")}\`  ${castPropertiesToCypher(
        attributes,
      )} ) \n`;
    else cypher += `CREATE (\`n_${node}\` ${castPropertiesToCypher(attributes)} ) \n`;
  }

  // Using the iterator
  for (const [edge, attributes, source, target] of graph.edgeEntries()) {
    if (attributes[opts.type])
      cypher += ` CREATE (\`n_${source}\`)-[:\`${attributes["@type"]}\` ${castPropertiesToCypher(
        attributes,
      )} ]->(\`n_${target}\`) \n`;
    else throw Error(`Edge ${edge} has no type defined`);
  }

  return cypher;
}

function castPropertiesToCypher(properties: { [key: string]: unknown }): string {
  return `{ ${Object.keys(properties)
    .filter((name: string) => !["@id", "@labels", "@type"].includes(name))
    .map((name: string) => `\`${name}\`: ${castValueToCypher(properties[name])}`)} }`;
}

function castValueToCypher(value: unknown): string {
  if (Array.isArray(value)) return `[ ${value.map(item => castValueToCypher(item)).join(", ")} ]`;
  else {
    switch (typeof value) {
      case "number":
        return `${value}`;
        break;
      case "boolean":
        return `${value === true ? "true" : "false"}`;
      default:
        return `"${String(value).replace('"', '\\"')}"`;
    }
  }
}
