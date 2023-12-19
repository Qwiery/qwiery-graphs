import { describe, test, it, expect } from "vitest";

import {JsonGraph} from "../src/formats/jsonGraph.js";
import { PseudoCypher, PseudoCypherEdge, PseudoCypherNode, PseudoCypherTriple } from "../src/formats/pseudoCypher";

describe("PseudoCypher", function () {
	it("should parse a PseudoCypherNode", function () {
		let node = PseudoCypherNode.parse("h1");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("h1");
		expect(node.typeName).toBeNull();
		expect(node.data).toBeNull();

		node = PseudoCypherNode.parse("(A)");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("A");
		expect(node.typeName).toBeNull();
		expect(node.data).toBeNull();

		node = PseudoCypherNode.parse("h14:A");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("h14");
		expect(node.typeName).toEqual("A");
		expect(node.data).toBeNull();

		expect(PseudoCypherNode.parse("")).toBeNull();
		expect(PseudoCypherNode.parse(null)).toBeNull();
		expect(PseudoCypherNode.parse("123a")).toBeNull();

		node = PseudoCypherNode.parse("h14:A{x:12}");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("h14");
		expect(node.typeName).toEqual("A");
		expect(node.data).toEqual({ x: 12 });

		node = PseudoCypherNode.parse("cat{x:13}");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("cat");
		expect(node.typeName).toBeNull();
		expect(node.data).toEqual({ x: 13 });

		node = PseudoCypherNode.parse("(daddy{u:'abc'})");
		expect(node).not.toBeNull();
		expect(node.name).toEqual("daddy");
		expect(node.typeName).toBeNull();
		expect(node.data).toEqual({ u: "abc" });

		node = PseudoCypherNode.parse(":Dog");
		expect(node).not.toBeNull();
		expect(node.name).toBeNull();
		expect(node.typeName).toEqual("Dog");
		expect(node.data).toEqual(null);

		node = PseudoCypherNode.parse(':Dog{color:"red"}');
		expect(node).not.toBeNull();
		expect(node.name).toBeNull();
		expect(node.typeName).toEqual("Dog");
		expect(node.data).toEqual({ color: "red" });

		node = PseudoCypherNode.parse('(:Dog{color:"red"})');
		expect(node).not.toBeNull();
		expect(node.name).toBeNull();
		expect(node.typeName).toEqual("Dog");
		expect(node.data).toEqual({ color: "red" });

		node = PseudoCypherNode.parse("p:Process{u:[1,2], v:'t' }");
		expect(node.toCypher()).toEqual("(p:Process{u: [1, 2], v: 't'})");

		node = new PseudoCypherNode("a", "car", { u: 34 });
		expect(node.toCypher()).toEqual("(a:car{u: 34})");

		node = PseudoCypherNode.parse({ name: "d", id: 123 });
		expect(node.toCypher()).toEqual("(d{name: 'd', id: 123})");

		node = PseudoCypherNode.parse(123);
		expect(node).toEqual(null);

		node = new PseudoCypherNode("a", "car", { u: 34 });
		expect(node.toEntity()).toEqual({ u: 34, typeName: "car", name: "a" });

		node = PseudoCypherNode.parse(12);
		expect(node).toBeNull();

		node = PseudoCypherNode.parse("->");
		expect(node).toBeNull();
		node = PseudoCypherNode.parse("()");
		expect(node.toCypher()).toEqual("()");
	});

	it("should parse a PseudoCypherEdge", function () {
		let edge = PseudoCypherEdge.parse("label");
		expect(edge).not.toBeNull();
		expect(edge.name).toEqual("label");
		expect(edge.typeName).toBeNull();
		expect(edge.data).toBeNull();

		edge = PseudoCypherEdge.parse("h14:A");
		expect(edge).not.toBeNull();
		expect(edge.name).toEqual("h14");
		expect(edge.typeName).toEqual("A");
		expect(edge.data).toBeNull();

		expect(PseudoCypherEdge.parse("")).toBeNull();
		expect(PseudoCypherEdge.parse(null)).toBeNull();
		expect(PseudoCypherEdge.parse("123a")).toBeNull();

		edge = PseudoCypherEdge.parse("h14:A{x:12}");
		expect(edge).not.toBeNull();
		expect(edge.name).toEqual("h14");
		expect(edge.typeName).toEqual("A");
		expect(edge.data).toEqual({ x: 12 });

		edge = PseudoCypherEdge.parse("cat{x:13}");
		expect(edge).not.toBeNull();
		expect(edge.name).toEqual("cat");
		expect(edge.typeName).toBeNull();
		expect(edge.data).toEqual({ x: 13 });
		expect(edge.toEntity()).toEqual({ name: "cat", x: 13 });

		edge = PseudoCypherEdge.parse("[:Dog]");
		expect(edge).not.toBeNull();
		expect(edge.name).toBeNull();
		expect(edge.typeName).toEqual("Dog");
		expect(edge.data).toEqual(null);

		edge = PseudoCypherEdge.parse('[:Dog{color:"red"}]');
		expect(edge).not.toBeNull();
		expect(edge.name).toBeNull();
		expect(edge.typeName).toEqual("Dog");
		expect(edge.data).toEqual({ color: "red" });

		edge = PseudoCypherEdge.parse("p:Process{u:[1,2], v:'t' }");
		expect(edge.toCypher()).toEqual("[p:Process{u: [1, 2], v: 't'}]");
	});

	it("should parse a PseudoCypherTriple", function () {
		let triple = new PseudoCypherTriple("A", "B");
		expect(triple.edge).toEqual(null);
		expect(triple.source.name).toEqual("A");
		expect(triple.target.name).toEqual("B");

		triple = new PseudoCypherTriple("J");
		expect(triple.edge || null).toEqual(null);
		expect(triple.source.name).toEqual("J");
		expect(triple.target || null).toEqual(null);
		expect(triple.toCypher()).toEqual("(J)");

		triple = new PseudoCypherTriple("A", "d", "B");
		expect(triple.edge.name).toEqual("d");
		expect(triple.source.name).toEqual("A");
		expect(triple.target.name).toEqual("B");
		expect(triple.toCypher()).toEqual("(A)-[d]->(B)");

		triple = new PseudoCypherTriple("A", "d{k:34}", "B:Person");
		expect(triple.edge.name).toEqual("d");
		expect(triple.edge.data.k).toEqual(34);
		expect(triple.source.name).toEqual("A");
		expect(triple.target.name).toEqual("B");
		expect(triple.target.typeName).toEqual("Person");
		expect(triple.toCypher()).toEqual("(A)-[d{k: 34}]->(B:Person)");

		triple = PseudoCypherTriple.parse("A");
		expect(triple).not.toBeNull();
		expect(triple.source.name).toEqual("A");
		expect(triple.edge).toEqual(null);
		expect(triple.target || null).toEqual(null);

		triple = PseudoCypherTriple.parse("(A)-->(B)");
		expect(triple).not.toBeNull();
		expect(triple.source.name).toEqual("A");
		expect(triple.edge || null).toEqual(null);
		expect(triple.target.name).toEqual("B");

		triple = PseudoCypherTriple.parse("(A)-[:Thing]->(B)");
		expect(triple).not.toBeNull();
		expect(triple.source instanceof PseudoCypherNode).toBeTruthy();
		expect(triple.target instanceof PseudoCypherNode).toBeTruthy();
		expect(triple.edge instanceof PseudoCypherEdge).toBeTruthy();
		expect(triple.source.name).toEqual("A");
		expect(triple.edge.typeName).toEqual("Thing");
		expect(triple.edge.name).toEqual(null);
		expect(triple.target.name).toEqual("B");
		expect(triple.toCypher()).toEqual("(A)-[:Thing]->(B)");

		triple = PseudoCypherTriple.parse({ u: 1, v: 2 });
		expect(triple).toBeNull();
	});

	it("should parse nodes", function () {
		let n = PseudoCypher.parseNode("(a)");
		expect(n.name).toEqual("a");
		expect(n.typeName).toEqual("Unknown");
		expect(n.id).toBeDefined();

		n = PseudoCypher.parseNode("(c:Car{id:16, v:'r'})");
		expect(n.name).toEqual("c");
		expect(n.typeName).toEqual("Car");
		expect(n.id).toEqual("16");
		expect(n.v).toEqual("r");
	});

	it("should parse edges", function () {
		let e = PseudoCypher.parseEdge("(a{id:1})-->(b{id:2})");
		expect(e.sourceId).toEqual("1");
		expect(e.targetId).toEqual("2");
		expect(e.typeName).toEqual("Link");
		expect(e.name).toBeUndefined();

		e = PseudoCypher.parseEdge("(a{id:1})-[sim:Stuff]->(b{id:2})");
		expect(e.typeName).toEqual("Stuff");
		expect(e.name).toEqual("sim");
	});

	it("should turn an entity into pseudo-cypher", function () {
		const task = {
			typeName: "ProcessTask",
			id: 12,
			name: "T1",
		};
		expect(PseudoCypherNode.entityToCypher(task)).toEqual("(T1:ProcessTask{typeName: 'ProcessTask', id: 12, name: 'T1'})");
		const link = {
			typeName: "MyLink",
			x: 45,
			name: "c",
		};
		expect(PseudoCypherEdge.entityToCypher(link)).toEqual("[c:MyLink{typeName: 'MyLink', x: 45, name: 'c'}]");
	});

	it("should parse single lines of pseudo-cypher", function () {
		let g = PseudoCypher.parse("a-->b");
		// it's not valid pseudo-cypher
		expect(g?.nodes.length).toEqual(0);

		g = PseudoCypher.parse("(a)-->(b)");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);

		g = PseudoCypher.parse("(a)-[]->(b)");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);

		g = PseudoCypher.parse("(a{id:'a'})-->(b{id:'b'})");
		expect(g.nodes[0].id).toEqual("a");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);

		g = PseudoCypher.parse("(a{id:'a'})-[]->(b{id:'b'})");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		// console.log(JSON.stringify(g))//?

		g = PseudoCypher.parse("(a{id:'a'})-[v]->(b{id:'b'})");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		expect(g.edges[0].name).toEqual("v");
		expect(g.edges[0].typeName).toEqual("Link");

		g = PseudoCypher.parse("(a{id:'a'})-[v:S{id:4}]->(b{id:'b'})");
		expect(g.nodes.length).toEqual(2);
		expect(g.edges.length).toEqual(1);
		expect(g.edges[0].name).toEqual("v");
		expect(g.edges[0].typeName).toEqual("S");
		expect(g.edges[0].id).toEqual("4");

		g = PseudoCypher.parse("(a)-->(b)-->(c)-[]->(d)");
		expect(g.nodes.length).toEqual(4);
		expect(g.edges.length).toEqual(3);
		expect(g.nodes.map((n) => n.name)).toEqual(["a", "b", "c", "d"]);

		g = PseudoCypher.parse("(a{id:1})-[:Bus]->(b{id:2})-->(c)-[v]->(d)");
		const found = JsonGraph.getEdge(g, "1", "2");
		expect(found.typeName).toEqual("Bus");
	});

	it("should convert a plain object to a cypher-like object", function () {
		let stuff = { a: 34, b: 23 };
		const c = PseudoCypherTriple.toCypherData(stuff);
		expect(c).toEqual("{a: 34, b: 23}");

		let e = { id: 1, name: "red", typeName: "A" };
		let s = PseudoCypherNode.entityToCypher(e);
		expect(s).toEqual("(red:A{id: 1, name: 'red', typeName: 'A'})");
		s = PseudoCypherNode.entityToCypher(e, "");
		expect(s).toEqual("(:A{id: 1, name: 'red', typeName: 'A'})");
		s = PseudoCypherNode.entityToCypher(e, "v");
		expect(s).toEqual("(v:A{id: 1, name: 'red', typeName: 'A'})");
	});

	it("should turn an entity to pseudo-cypher", function () {
		expect(PseudoCypherTriple.entityToCypher({ a: 1 })).toEqual(null);

		expect(
			PseudoCypherTriple.entityToCypher({
				sourceId: 1,
				targetId: 2,
				a: 1,
			}),
		).toEqual("(u{id: 1})-[r{a:1}]->(v{id: 2})");

		expect(
			PseudoCypherTriple.entityToCypher({
				sourceId: 1,
				targetId: 2,
				a: 1,
				name: "K",
			}),
		).toEqual("(u{id: 1})-[K{a:1}]->(v{id: 2})");

		expect(
			PseudoCypherTriple.entityToCypher({
				sourceId: 1,
				targetId: 2,
				a: 1,
				name: "K",
				typeName: "P",
			}),
		).toEqual("(u{id: 1})-[K:P{a:1}]->(v{id: 2})");
	});

	it("should create an entity dictionary", () => {
		let dic = PseudoCypher.createEntityDictionary("(a{id:4})-->(b:K)-->(:M{id:5})");
		expect(Object.keys(dic).length).toEqual(2);
		expect(dic["a"].id).toEqual(4);

		dic = PseudoCypher.createEntityDictionary("(a)-->(b)-->(c)-[]->(d)");
		expect(Object.keys(dic).length).toEqual(4);
		console.log(JSON.stringify(dic, null, 2));
	});

	it("should create loops", () => {
		let g = PseudoCypher.parse("(a)-->(a)");
		expect(g.nodes).toHaveLength(1);
		expect(g.edges).toHaveLength(1);
		expect(g.nodes[0].name).toEqual("a");
	});

	it("should allow multi-graphs", () => {
		let g = PseudoCypher.parse("(a)-[:A]->(a)-[:B]->(a)");
		expect(g.nodes).toHaveLength(1);
		expect(g.edges).toHaveLength(2);
	});
});
