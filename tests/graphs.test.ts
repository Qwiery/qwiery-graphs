import { describe, test, it, expect } from "vitest";

import {NamedGraph} from "../src/graphData/namedGraph";
import {GraphUtils} from "../src/graphUtils";
import {Constants} from "../src/constants";
import {Graph} from "../src/graph";
import _ from "lodash";
import { Utils } from "@orbifold/utils";

describe("Graphs", function () {
	it("should do the basics", function () {
		const g = new Graph();

		const n1 = g.addNode({ typeName: "Thought" });
		expect(g.idExists(n1.id)).toBeTruthy();
		expect(g.nodeCount).toEqual(1);
		const thoughts = g.getByTypeName("Thought");
		expect(thoughts.length).toEqual(1);

		// has to be a NodeBase something
		expect(() => g.addNode({})).toThrow(Error);

		expect(() => g.addEdge(12)).toThrow(Error);
		expect(() => g.addEdge({})).toThrow(Error);
		expect(() => g.addEdge({ x: 34 })).toThrow(Error);
		expect(() => g.addEdge({ typeName: "Thought" })).toThrow(Error);
		// expect(() => g.addEdge({sourceId: 12, targetId: 44})).toThrow(Error);
		// expect(() => g.addEdge({sourceId: 12, targetId: n1.id})).toThrow(Error);

		const n2 = g.addNode({ typeName: "Thought" });
		expect(() =>
			g.addEdge({
				typeName: Constants.GenericLinkTypeName,
				sourceId: n2.id,
				targetId: n1.id,
			}),
		).not.toThrow(Error);
		expect(g.edgeCount).toEqual(1);
		expect(g.edges[0].sourceId).toEqual(n2.id);
		expect(g.getByTypeName(Constants.GenericLinkTypeName).length).toEqual(1);

		const removals = g.removeNode(n2.id);
		expect(removals.length).toEqual(1);
		expect(removals[0].id).toEqual(n2.id);
		expect(g.edgeCount).toEqual(0);

		expect(() => g.removeNode({})).toThrow(Error);
		expect(() => g.removeNode(null)).toThrow(Error);
		expect(() => g.removeNode(6546)).toThrow(Error);
		expect(() => g.removeNode({ typeName: "" })).toThrow(Error);
	});

	it("should add nodes via pseudo-cypher", function () {
		const g = new Graph();
		const a = g.addNode("(a)");
		const b = g.addNode("(b:{name:'Stan'})");
		expect(g.getNodeByName("sTaN")).not.toBeNull();
		expect(g.getNodesByName(["sTaN"])).toHaveLength(1);
		expect(g.findNode({ name: "Stan" })).not.toBeNull();
		g.addEdge("a", "b");
		expect(g.getNodeByName("Stan").id).toEqual(b.id);
		expect(g.getNodeByName("a").id).toEqual(a.id);
	});

	it("should create graphs from pseudo-cypher definitions", function () {
		let g = Graph.fromPseudoCypher("T");
		expect(g.nodeCount).toEqual(1);
		expect(g.nodes[0]["name"]).toEqual("T");
		expect(g.nodes[0]["typeName"] || null).not.toBeNull();

		// we can create loops
		g = Graph.fromPseudoCypher("(T)-->(T)");
		// there are two because the id not the same on generation

		expect(g.nodeCount).toEqual(1);
		expect(g.edgeCount).toEqual(1);
		expect(g.edges[0]["typeName"]).toEqual(Constants.GenericLinkTypeName);
		expect(g.nodes[0]["name"]).toEqual("T");

		g = Graph.fromPseudoCypher("(T{id:1})-->(T)");
		// now we have a loop
		expect(g.nodeCount).toEqual(1);
		expect(g.edgeCount).toEqual(1);
		expect(g.edges[0]["typeName"]).toEqual(Constants.GenericLinkTypeName);
		expect(g.nodes[0]["name"]).toEqual("T");

		g = Graph.fromPseudoCypher("(T1)-->(T2)-->(T3)");
		expect(g.nodeCount).toEqual(3);
		expect(g.edgeCount).toEqual(2);
		expect(g.edges[0]["typeName"]).toEqual(Constants.GenericLinkTypeName);
		expect(g.nodes[0]["name"]).toEqual("T1");

		g = Graph.fromPseudoCypher("(T1{id:1})-->(T2)-->(T1)");
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(2);
		expect(g.edges[0]["typeName"]).toEqual(Constants.GenericLinkTypeName);
		expect(g.nodes[0]["name"]).toEqual("T1");

		g = Graph.fromPseudoCypher("(p:ProcessTask{duration: 33.2, name:'a'})");
		let node = g.getNodeByName("p");
		expect(node || null).not.toBeNull();
		expect(node["typeName"]).toEqual("ProcessTask");
		expect(node.data.duration).toEqual(33.2);

		g = Graph.fromPseudoCypher("(p{duration: 33.2, name:'a'})");
		node = g.getNodeByName("p");
		expect(node || null).not.toBeNull();
		expect(node.data.duration).not.toBeUndefined();
	});

	it("should get the flows", function () {
		let g = Graph.fromPseudoCypher(`
			(T1)-->(T2{id:2})-->(T3)
			(T2)-->(T4)
		`);
		expect(g.nodeCount).toEqual(4);
		expect(g.edgeCount).toEqual(3);

		let coll = [];
		let paths = [];
		const getName = (n, level, path, hasChildren) => {
			coll.push(n["name"]);
			if (!hasChildren) {
				paths.push(path);
			}
		};
		let t1 = g.getNodeByName("T1");
		g.dft(getName, t1);
		expect(coll).toEqual(["T1", "T2", "T3", "T4"]);
		expect(paths.length).toEqual(2);
		// should be the same as the getFlows method
		paths = g.getFlows(t1).map((p) => p.map((u) => u.name));
		expect(paths).toEqual([
			["T1", "T2", "T3"],
			["T1", "T2", "T4"],
		]);
		// graph with cycle
		g = Graph.fromPseudoCypher(`
			(T1{id:1})-->(T2)-->(T3{id:3})
			(T3)-->(T1)
		`);
		t1 = g.getNodeByName("T1");
		expect(() => g.getFlows(t1)).toThrow(Error);
	});

	it("should parse complex structures", function () {
		let g = Graph.fromPseudoCypher(`
            (T1:ProcessTask{id: 'T1', typeName: 'ProcessTask', effectiveWorkTime: 80, name: 'T1', startTime: '05/01/21', duration: 3})-[SL1:SolutionArtifactLink{name: 'SL1', typeName: 'SolutionArtifactLink', id: 'SL1', solutionDuration: 2.2, solutionWorkTime: 5.5}]->(T2:ProcessTask{id: 'T2', typeName: 'ProcessTask', name: 'T2', effectiveWorkTime: 71, startTime: '05/10/21', duration: 4})-->(T3:ProcessTask{id: 'T3', typeName: 'ProcessTask', name: 'T3', effectiveWorkTime: 6, startTime: '05/15/21', duration: 7})
		`);
		expect(g.nodeCount).toEqual(3);
		expect(g.edgeCount).toEqual(2);
		const t1 = g.getNodeByName("T1");
		const t2 = g.getNodeByName("T2");
		const t3 = g.getNodeByName("T3");
		const sl1 = g.getEdgeById("SL1");
		expect(t1.data["effectiveWorkTime"]).toEqual(80);
		expect(t3.data["startTime"]).toEqual("05/15/21");
	});

	it("should pick up edge labels", () => {
		let g = Graph.fromPseudoCypher("(a)-[:K]->(b)");
		expect(g.nodeCount).toEqual(2);
		expect(g.nodes.map((n) => n.name)).toEqual(["a", "b"]);
		expect(g.edgeCount).toEqual(1);
		expect(g.edges[0].typeName).toEqual("K");

		g = Graph.fromPseudoCypher(`
		(n1)-[:A]->(n2)
		(n1)-[:C]->(n4)
		(n1)-[:A]->(n5)
		(n2)-[:B]->(n3)
		(n5)-[:B]->(n6)
		(n5)-[:C]->(n6)
		(n7)-[:A]->(n8)
		(n9)-[:C]->(n10)
		`);
		expect(g.nodeCount).toEqual(10);
		// expect(g.nodes.map((n) => n.name)).toEqual(["a", "b"]);
		expect(g.edgeCount).toEqual(8);
	});

	it("should use the custom creators", function () {
		const nCreator = (u) => {
			return {
				id: Utils.id(),
				typeName: "Artifact",
				name: u.name || Utils.randomLetter(),
				parentId: null,
			};
		};
		const eCreator = (u) => {
			return {
				id: Utils.id(),
				typeName: "ProcessLink",
				sourceId: null,
				targetId: null,
			};
		};
		const g = Graph.fromPseudoCypher("(a)-->(b)", nCreator, eCreator);
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		expect(g.nodes[0]["typeName"]).toEqual("Unknown");
		expect(g.edges[0]["typeName"]).toEqual("ProcessLink");
	});

	it("should import the arrows format", function () {
		let g = Graph.fromArrows("a->b");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		expect(g.nodes[0].id).toEqual("a");
		expect(g.nodes[1].id).toEqual("b");

		g = Graph.fromArrows(["a->b", ""]);
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		expect(g.nodes[0].id).toEqual("a");
		expect(g.nodes[1].id).toEqual("b");
	});

	it("should keep the graph simple", function () {
		// a simple graph does not have multiple edges between two nodes,
		// adding multiple times the same edge does not raise an error
		let g = Graph.fromArrows("a->a->a");
		expect(g.edges.length).toEqual(1);
		expect(g.nodes.length).toEqual(1);
		expect(g.hasLoops).toBeTruthy();
		expect(g.edgeExists("a", "a")).toBeTruthy();

		g = Graph.fromArrows(["a->b", "a->b"]);
		expect(g.edges.length).toEqual(1);
		expect(g.nodes.length).toEqual(2);
		expect(g.edgeExists("a", "b")).toBeTruthy();
		expect(g.edgeExists("a", "c")).not.toBeTruthy();
		expect(g.edgeExists("a", "a")).not.toBeTruthy();
		expect(g.hasLoops).toBeFalsy();
	});

	it("should get the adjacency list", function () {
		let g = Graph.fromArrows(["a->b", "b->a"]);
		let adj = g.toAdjacencyList();
		expect(adj).toEqual({ a: ["b"], b: ["a"] });

		g = Graph.fromArrows(["a->b", "b->a", "b->c", "d"]);
		adj = g.toAdjacencyList();
		expect(adj).toEqual({ a: ["b"], b: ["a", "c"], c: [], d: [] });
	});

	it("should get cycles", function () {
		let g = Graph.fromArrows(["a->b->c->a", "d->d"]);
		expect(g.getCycle()).toEqual(["d", "d"]);
		expect(g.hasCycles).toBeTruthy();
		expect(g.isAcyclic).toBeFalsy();

		g = Graph.fromArrows(["a->b->c"]);
		expect(g.getCycle()).toBeNull();
		expect(g.hasCycles).toBeFalsy();
		expect(g.isAcyclic).toBeTruthy();
	});

	it("should import mtx", function () {
		const data = `
		%MatrixMarket and so on
		2 4 5
		1 2
		2 3
		3 4
		`;
		const g = Graph.fromMtx(data);
		expect(g.nodes.length).toEqual(4);
		expect(g.edges.length).toEqual(3);
		expect(() => {
			Graph.fromMtx("something");
		}).toThrow(Error);
	});

	it("should get degrees", function () {
		let g = Graph.fromArrows(`
		1->1
		1->2
		2->2
		`);
		expect(g.getDegrees()).toEqual({ 1: 3, 2: 3 });

		g = Graph.fromArrows(`
		1->2
		1->2
		2->3
		`);
		expect(g.getDegrees()).toEqual({ 1: 1, 2: 2, 3: 1 });

		g = Graph.fromArrows(`
		1->2
		1->3
		1->4
		1->5
		`);
		expect(g.getDegrees()).toEqual({ 1: 4, 2: 1, 3: 1, 4: 1, 5: 1 });
	});

	it("should get the component of a node", function () {
		let g = Graph.fromArrows(`
		1->2->3->4
		5->6
		`);
		let c = g.getComponentOf("2");
		expect(c.map((u) => parseInt(u)).sort()).toEqual([1, 2, 3, 4]);

		c = g.getComponentOf("6");
		expect(c.map((u) => parseInt(u)).sort()).toEqual([5, 6]);

		// cycles and all
		g = Graph.fromArrows(`
		1->2->3->4->2
		5->6
		`);
		c = g.getComponentOf("2");
		expect(c.map((u) => parseInt(u)).sort()).toEqual([1, 2, 3, 4]);

		c = g.getComponentOf("6");
		expect(c.map((u) => parseInt(u)).sort()).toEqual([5, 6]);

		c = g.getComponentOf("36");
		expect(Utils.isEmpty(c)).toBeTruthy();
	});

	it("should do a dft", function () {
		let g = Graph.fromArrows(`
		1->2->4
		2->3->5
		`);
		const acc = [];
		const visitor = (n) => {
			acc.push(parseInt(n.id));
		};
		g.dft(visitor, g.getNodeById("1"));
		expect(acc.length).toEqual(5);
		expect(acc).toEqual([1, 2, 4, 3, 5]);
		// clear the acc
		acc.length = 0;
		g.bft(visitor, g.getNodeById("1"));
		expect(acc.length).toEqual(5);
		expect(acc).toEqual([1, 2, 4, 3, 5]);
	});

	it("should get components", function () {
		let g = Graph.fromArrows(`
		1->2
		3
		4->5
		`);
		let cs = g.getComponents();
		expect(cs.length).toEqual(3);
		g = Graph.fromArrows(`
		1->2->3->4
		2->5->3
		`);
		cs = g.getComponents();
		expect(cs.length).toEqual(1);
	});

	it("should fetch the karate club", function () {
		const g = NamedGraph.karateClub();
		expect(g.edges.length).toEqual(78);
		expect(g.nodes.length).toEqual(34);
	});

	it("should test for equality", function () {
		expect(GraphUtils.areEqual("a", "a")).toBeTruthy();
		expect(GraphUtils.areEqual("a", "b")).not.toBeTruthy();
		expect(GraphUtils.areEqual("a", 12)).not.toBeTruthy();
		expect(GraphUtils.areEqual(12, 12)).toBeTruthy();
		expect(GraphUtils.areEqual(12, false)).not.toBeTruthy();
		expect(GraphUtils.areEqual(false, false)).toBeTruthy();
		// not something areEqual understands as a node, edge or graph
		expect(GraphUtils.areEqual({ x: 12 }, { x: 12 })).not.toBeTruthy();
		// interpreted as graphs or nodes
		expect(GraphUtils.areEqual({ id: 12 }, { id: 12 })).toBeTruthy();
		// only the id is used
		expect(GraphUtils.areEqual({ id: 12, name: "a" }, { id: 12, name: "b" })).toBeTruthy();
		expect(GraphUtils.areEqual({ id: 11 }, { id: 12 })).not.toBeTruthy();

		expect(GraphUtils.areEqual({ sourceId: 1, targetId: 2 }, { sourceId: 1, targetId: 2 })).toBeTruthy();
		expect(GraphUtils.areEqual({ sourceId: 1, targetId: 2 }, { sourceId: 1, targetId: 3 })).not.toBeTruthy();
		expect(GraphUtils.areEqual({ sourceId: 1, targetId: 2, name: "a" }, { sourceId: 1, targetId: 2 })).not.toBeTruthy();
		// the label is not case-sensitive
		expect(
			GraphUtils.areEqual(
				{ sourceId: 1, targetId: 2, name: "a" },
				{
					sourceId: 1,
					targetId: 2,
					name: "A",
				},
			),
		).toBeTruthy();

		let g1 = new Graph();
		let g2 = g1;
		expect(GraphUtils.areEqual(g1, g2)).toBeTruthy();
		g2 = g1.clone();
		// clone generates a new id
		expect(GraphUtils.areEqual(g1, g2)).not.toBeTruthy();
	});

	it("should parse edge arrays", function () {
		let g = Graph.fromEdgeArray(["1->2", ["2", "3"]]);
		expect(g.edges.length).toEqual(2);
		expect(Graph.fromEdgeArray(undefined)).toBeNull();
		expect(Graph.fromEdgeArray([])).not.toBeNull();
		expect(Graph.fromEdgeArray([]).nodes).toHaveLength(0);
	});

	it("should get the parent hierarchy", function () {
		let g = Graph.fromEdgeArray(["a->b", "b->c", "c->d", "c->e"]);
		expect(g.nodes).toHaveLength(5);
		expect(g.edges).toHaveLength(4);
		const dh = g.getParentHierarchy("d").map((p) => p.id);
		expect(dh).toEqual(["c", "b", "a"]);
		const eh = g.getParentHierarchy("e").map((p) => p.id);
		expect(eh).toEqual(["c", "b", "a"]);
	});

	it("should get parents and children", function () {
		let g = Graph.fromEdgeArray(["p1->r", "p2->r", "r->c1", "r->c2"]);
		expect(g.getParents("r").map((n) => n.id)).toEqual(["p1", "p2"]);
		expect(g.getChildren("r").map((n) => n.id)).toEqual(["c1", "c2"]);
		expect(g.nodeCount).toEqual(5);
		expect(g.edgeCount).toEqual(4);
	});

	it("should parse pseudo-cypher", function () {
		let g = Graph.parse("(x)-->(y)");
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(1);
	});

	it("should merge graphs", function () {
		let g1 = Graph.fromEdgeArray(["1->2", "2->3"]);
		let g2 = Graph.fromEdgeArray(["3->4"]);
		let g = Graph.mergeGraphs(g1, g2);
		let merged = g1.mergeGraph(g2);
		// merged into g1
		expect(merged.id).toEqual(g1.id);
		expect(g1.nodeCount).toEqual(4);
		expect(g1.edgeCount).toEqual(3);
		expect(g1.nodes.map((n) => n.id)).toEqual(["1", "2", "3", "4"]);
		expect(g.nodes.map((n) => n.id)).toEqual(["1", "2", "3", "4"]);

		g1 = Graph.fromEdgeArray(["1->2", "2->3"]);
		g2 = Graph.fromEdgeArray(["2->3"]);
		g = Graph.mergeGraphs(g1, g2);
		expect(g1.nodeCount).toEqual(3);
		expect(g1.edgeCount).toEqual(2);
		expect(g1.nodes.map((n) => n.id)).toEqual(["1", "2", "3"]);
		expect(g.nodes.map((n) => n.id)).toEqual(["1", "2", "3"]);

		g.clear();
		expect(g.nodeCount).toEqual(0);
		expect(g.edgeCount).toEqual(0);
	});

	it("should get edges", function () {
		let g = Graph.fromEdgeArray(["1->2", "2->2"]);
		expect(g.getEdges("2")).toHaveLength(2);
		expect(g.getDegree("2")).toEqual(3);
		expect(g.maxDegree).toEqual(3);
		expect(g.minDegree).toEqual(1);
		expect(g.getEdgesBetween("2", "2")).toHaveLength(1);
		expect(g.getEdge("2", "2")).not.toBeNull();
		expect(g.getEdgesBetween("2", "1")).toHaveLength(1);
		expect(g.getEdgesBetween("2", "1", false)).toHaveLength(0);
		expect(g.getEdgesBetween("1", "2", false)).toHaveLength(1);
		expect(g.filterEdges((e) => e.sourceId === "1")).toHaveLength(1);
		g.removeEdge({ sourceId: "1", targetId: "2" });
		expect(g.getEdge("1", "2")).toBeNull();
	});

	it("should create specific graphs", function () {
		expect(Graph.create()).toBeInstanceOf(Graph);
		let g = Graph.create("Complete");
		expect(g).toBeInstanceOf(Graph);
		expect(g.nodeCount).toEqual(10);

		g = Graph.create("pAth");
		expect(g).toBeInstanceOf(Graph);
		expect(g.nodeCount).toEqual(10);
		expect(g.edgeCount).toEqual(9);

		g = Graph.create("pAth", { size: 2 });
		expect(g).toBeInstanceOf(Graph);
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(1);

		g = Graph.create("Karate");
		expect(g).toBeInstanceOf(Graph);
		expect(g.nodeCount).toEqual(34);

		g = Graph.create("Singleton");
		expect(g.nodeCount).toEqual(1);

		g = Graph.create("Singletons");
		expect(g.nodeCount).toEqual(10);

		g = Graph.create("tree", { childrenCount: 2, height: 1 });
		expect(g.nodeCount).toEqual(3);

		g = Graph.create("erdos", { nodeCount: 2, edgeCount: 1 });
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(1);

		g = Graph.create("gilbert", { nodeCount: 12, probability: 0 });
		expect(g.nodeCount).toEqual(12);
		expect(g.edgeCount).toEqual(0);

		g = Graph.create("gilbert", { nodeCount: 3, probability: 1 });
		expect(g.nodeCount).toEqual(3);
		expect(g.edgeCount).toEqual(6); // one in each direction

		g = Graph.create("barabasi", { nodeCount: 31 });
		expect(g.nodeCount).toEqual(31);

		g = Graph.create("small world", { nodeCount: 31 });
		expect(g.nodeCount).toEqual(31);

		g = Graph.create("alpha", { nodeCount: 31 });
		expect(g.nodeCount).toEqual(31);

		g = Graph.create("women");
		expect(g.nodeCount).toEqual(32);
		expect(g.edgeCount).toEqual(89);
	});

	it("should accept a JSON graph", () => {
		const g = new Graph({ nodes: [{ id: "a" }, { id: "b" }], edges: [{ source: "a", target: "b" }] });
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(1);
	});

	it("should work with arbitrary node data", () => {
		const g = new Graph();
		const a = g.addNode({ x: 3 });
		const b = g.addNode({ y: 3 });
		const e = g.addEdge(a, b);
		expect(g.nodeCount).toEqual(2);
		expect(g.edgeCount).toEqual(1);
		expect(g.getChildren(a)).toHaveLength(1);
		// adding a node without anything also works
		const c = g.addNode();
		expect(g.nodeCount).toEqual(3);

		console.log(JSON.stringify(g, null, 2));
	});

	it("should sample a graph", () => {
		let g = Graph.create("erdos", { nodeCount: 300, edgeCount: 300 });
		let amount = Utils.randomInteger(5, 100);
		let h = g.sample(amount);
		expect(h.nodeCount).toEqual(amount);
		h = g.sample();
		expect(h.nodeCount).toEqual(100);

		// should take the whole graph is asked more than available
		g = Graph.create("erdos", { nodeCount: 20, edgeCount: 30 });
		h = g.sample(5000);
		expect(h.nodeCount).toEqual(20);
		expect(h.edgeCount).toEqual(30);
	});

	it("should re-index", () => {
		const g = Graph.fromArrows(["a->b->c"]);
		expect(g.getById("a")).not.toBeNull();
		let dic = g.reIndex();
		expect(g.getById("a")).toBeNull();
		expect(g.getById(dic["a"])).not.toBeNull();
		// console.log(JSON.stringify(dic, null, 3));
		// console.log(JSON.stringify(g.edges, null, 3));
		expect(g.areConnected(dic["a"], dic["b"]));
	});
});
