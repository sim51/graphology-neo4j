"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypherProjectionToGraph = void 0;
const graphology_1 = __importDefault(require("graphology"));
const neo4j_driver_1 = require("neo4j-driver");
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
function cypherProjectionToGraph(neo4j, cypherNodes, cypherRelationships, params = {}, opts = { id: "@id", labels: "@labels", type: "@type" }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Init the graph
        const graph = new graphology_1.default({
            multi: true,
            type: "directed",
            allowSelfLoops: true,
        });
        // Create the session
        const neoSession = neo4j.driver.session({
            defaultAccessMode: neo4j_driver_1.session.READ,
            database: neo4j.database,
        });
        // Load nodes
        yield new Promise((resolveNodes, rejectNodes) => {
            neoSession.run(cypherNodes, params).subscribe({
                onNext: (record) => {
                    if (!record.has("id"))
                        rejectNodes(new Error("Node's query must return an `id` field"));
                    const _a = record.toObject(), { id, labels } = _a, props = __rest(_a, ["id", "labels"]);
                    const node = Object.assign(Object.assign({}, props), { [opts.id]: id, [opts.labels]: labels || [] });
                    graph.mergeNode(id, node);
                },
                onCompleted: () => {
                    resolveNodes();
                },
                onError: (error) => {
                    neoSession.close();
                    rejectNodes(error);
                },
            });
        });
        // Load relationship
        yield new Promise((resolveEdges, rejectEdges) => {
            neoSession.run(cypherRelationships, params).subscribe({
                onNext: (record) => {
                    if (!record.has("source") || !record.has("target"))
                        rejectEdges(new Error("Relationship's query must return an `source` & `target` field"));
                    const _a = record.toObject(), { source, target, id, type } = _a, props = __rest(_a, ["source", "target", "id", "type"]);
                    const relId = id || `${source}->${target}`;
                    const rel = Object.assign(Object.assign({}, props), { [opts.id]: relId, [opts.type]: type || "" });
                    graph.mergeEdgeWithKey(relId, source, target, rel);
                },
                onCompleted: () => {
                    neoSession.close();
                    resolveEdges();
                },
                onError: (error) => {
                    neoSession.close();
                    rejectEdges(error);
                },
            });
        });
        // return the computed graph
        return graph;
    });
}
exports.cypherProjectionToGraph = cypherProjectionToGraph;
//# sourceMappingURL=cypher-projection-to-graph.js.map