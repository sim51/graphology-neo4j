(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("graphology"), require("neo4j-driver"));
	else if(typeof define === 'function' && define.amd)
		define(["graphology", "neo4j-driver"], factory);
	else if(typeof exports === 'object')
		exports["graphology-neo4j"] = factory(require("graphology"), require("neo4j-driver"));
	else
		root["graphology-neo4j"] = factory(root["graphology"], root["neo4j-driver"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__3__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cypherToGraph = void 0;
const graphology_1 = __importDefault(__webpack_require__(2));
const neo4j_driver_1 = __webpack_require__(3);
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


/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cypherProjectionToGraph = void 0;
const graphology_1 = __importDefault(__webpack_require__(2));
const neo4j_driver_1 = __webpack_require__(3);
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


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cypherProjectionToGraph = exports.cypherToGraph = void 0;
const cypher_to_graph_1 = __webpack_require__(1);
Object.defineProperty(exports, "cypherToGraph", ({ enumerable: true, get: function () { return cypher_to_graph_1.cypherToGraph; } }));
const cypher_projection_to_graph_1 = __webpack_require__(4);
Object.defineProperty(exports, "cypherProjectionToGraph", ({ enumerable: true, get: function () { return cypher_projection_to_graph_1.cypherProjectionToGraph; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=graphology-neo4j.js.map