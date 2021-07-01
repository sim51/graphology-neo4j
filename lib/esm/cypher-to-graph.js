"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypherToGraph = void 0;
const graphology_1 = __importDefault(require("graphology"));
const neo4j_driver_1 = require("neo4j-driver");
/**
 * Create a graphology graph based on the result of a cypher query.
 *
 * @param neo4j Object with the neo4j's driver and optionally the database name
 * @param cypher Query to executed for the graph creation
 * @param params Query's parameters
 * @param opts Allow you to defined the graphology attribut mapping for neo4j's ids (default @id), node's labels (default @labels) & relationship's type (default @type).
 * @returns A graphology instance
 */
function cypherToGraph(neo4j, cypher, params = {}, opts = { id: "@id", labels: "@labels", type: "@type" }) {
    return new Promise((resolve, reject) => {
        const graph = new graphology_1.default({
            multi: true,
            type: "directed",
            allowSelfLoops: true,
        });
        const neoSession = neo4j.driver.session({
            defaultAccessMode: neo4j_driver_1.session.READ,
            database: neo4j.database,
        });
        neoSession.run(cypher, params).subscribe({
            onNext: (record) => {
                // for each column
                record.forEach((value) => {
                    try {
                        pushValueInGraph(value, graph, opts);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            },
            onCompleted: () => {
                neoSession.close();
                resolve(graph);
            },
            onError: (error) => {
                neoSession.close();
                reject(error);
            },
        });
    });
}
exports.cypherToGraph = cypherToGraph;
/**
 * Given a query record item, do it's best to cast it as a graph elements (ie. node or relation),
 * and add add them in the graph.
 * NOTE: This method modifies the provided graph instance.
 *
 * @param value A record item to add
 * @param graph Graph instance on which we add the graph elements
 * @param opts Graphology attribut mapping for neo4j specific fields
 */
function pushValueInGraph(value, graph, opts) {
    // check if it's a node
    if (isNode(value)) {
        mergeNodeInGraph(value, graph, opts);
    }
    // check if it's a Relationship
    else if (isRelationship(value)) {
        mergeRelationshipInGraph(value, graph, opts);
    }
    // check if it's a Path
    else if (isPath(value)) {
        const path = value;
        mergeNodeInGraph(path.start, graph, opts);
        path.segments.forEach((seg) => {
            mergeNodeInGraph(seg.start, graph, opts);
            mergeRelationshipInGraph(seg.relationship, graph, opts);
            mergeNodeInGraph(seg.end, graph, opts);
        });
    }
    else if (Array.isArray(value)) {
        value.forEach((item) => {
            pushValueInGraph(item, graph, opts);
        });
    }
    else if (Object.prototype.toString.call(value) === "[object Object]") {
        Object.keys(value).forEach(key => {
            pushValueInGraph(value[key], graph, opts);
        });
    }
}
/**
 * Convert a Neo4j Node object and merge it into the graph instance.
 * NOTE: This method modifies the provided graph instance.
 *
 * @param node The Neo4j node to merge in the graph
 * @param graph The graph instance in which the node will be added.
 * @param opts Graphology attribut mapping for neo4j specific fields
 */
function mergeNodeInGraph(node, graph, opts) {
    const vertex = Object.assign(Object.assign({}, node.properties), { [opts.id]: node.identity.toString(), [opts.labels]: node.labels });
    graph.mergeNode(node.identity.toString(), vertex);
}
/**
 * Convert a Neo4j Relatonship object and merge it into the graph instance.
 * NOTE: This method modifies the provided graph instance.
 *
 * @param rel The Neo4j relatiponship to merge in the graph
 * @param graph The graph instance in which the node will be added.
 * @param opts Graphology attribut mapping for neo4j specific fields
 */
function mergeRelationshipInGraph(rel, graph, opts) {
    const edge = Object.assign(Object.assign({}, rel.properties), { [opts.id]: rel.identity.toString(), [opts.type]: rel.type });
    graph.mergeEdgeWithKey(rel.identity.toString(), `${rel.start}`, `${rel.end}`, edge);
}
/**
 * Given an object returned by the neo4j driver, this method check if it's a Node or not.
 *
 * @param object The cypher object to check
 * @returns `true` if the object is a Node, `false` otherwise
 */
function isNode(object) {
    let isNode = false;
    if (object &&
        Object.prototype.hasOwnProperty.call(object, "identity") &&
        Object.prototype.hasOwnProperty.call(object, "labels")) {
        isNode = true;
    }
    return isNode;
}
/**
 * Given an object returned by the neo4j driver, this method check if it's a Relationship or not.
 *
 * @param object The cypher object to check
 * @returns `true` if the object is a Relationship, `false` otherwise
 */
function isRelationship(object) {
    let isRel = false;
    if (object &&
        Object.prototype.hasOwnProperty.call(object, "identity") &&
        Object.prototype.hasOwnProperty.call(object, "type") &&
        Object.prototype.hasOwnProperty.call(object, "start") &&
        Object.prototype.hasOwnProperty.call(object, "end")) {
        isRel = true;
    }
    return isRel;
}
/**
 * Given an object returned by the neo4j driver, this method check if it's a path or not.
 *
 * @param object The cypher object to check
 * @returns `true` if the object is a Path, `false` otherwise
 */
function isPath(object) {
    let isPath = false;
    if (object &&
        Object.prototype.hasOwnProperty.call(object, "start") &&
        Object.prototype.hasOwnProperty.call(object, "end") &&
        Object.prototype.hasOwnProperty.call(object, "segments")) {
        isPath = true;
    }
    return isPath;
}
//# sourceMappingURL=cypher-to-graph.js.map