import { describe, test, it, expect } from "vitest";

import {GraphUtils} from "../src/graphUtils";

describe("GraphUtils", function () {
	it("should interpret diverse things as an edge specification", function () {
		const getEdge = (...e) => {
			const found = GraphUtils.getEdgeFromSpecs(...e);
			return [found.sourceId.toString(), found.targetId.toString()];
		};
		expect(getEdge(1, 2)).toEqual(["1", "2"]);
		expect(getEdge("1->2")).toEqual(["1", "2"]);
		expect(getEdge({ sourceId: 1, targetId: 2 })).toEqual(["1", "2"]);
		expect(() => getEdge(12)).toThrow(Error);
		expect(() => getEdge("")).toThrow(Error);
		expect(() => getEdge(true)).toThrow(Error);
		expect(() => getEdge(() => 7)).toThrow(Error);
		expect(() => getEdge([1, 2, 3])).toThrow(Error);
		expect(() => getEdge("4->4->4")).toThrow(Error);
		expect(() => getEdge("4->")).toThrow(Error);

		let e = GraphUtils.getEdgeFromSpecs("a", "b", "c");
		expect(e.sourceId).toEqual("a");
		expect(e.targetId).toEqual("b");
		expect(e.name).toEqual("c");

		expect(() => GraphUtils.getEdgeFromSpecs("a", "b", "c", "d")).toThrow(Error);
	});

	it("should interpret diverse things as a node specification", function () {
		let s = GraphUtils.getNodeFromSpecs();
		expect(s.typeName).toEqual("Thing");
		expect(s.name).toBeNull();

		s = GraphUtils.getNodeFromSpecs(true);
		expect(s.typeName).toEqual("Thing");
		expect(s.id).toEqual("true");

		expect(GraphUtils.getNodeFromSpecs(12)).toEqual({ id: "12", typeName: "Thing" });
		expect(GraphUtils.getNodeFromSpecs(12, "a")).toEqual({ id: "12", name: "a", typeName: "Thing" });
		expect(GraphUtils.getNodeFromSpecs({ id: 3 })).toEqual({ id: "3", typeName: "Thing" });
		expect(GraphUtils.getNodeFromSpecs("id", "name", "typeName")).toEqual({
			id: "id",
			name: "name",
			typeName: "typeName",
		});
		// over the top
		expect(() => GraphUtils.getNodeFromSpecs("a", "b", "c", "d")).toThrow(Error);

		expect(GraphUtils.getNodeFromSpecs({ id: 3, data: { x: 4 }, labels: ["A", "B"], z: 34 })).toEqual({ id: "3", data: { x: 4 }, labels: ["A", "B"], typeName: "Thing", z: 34 });
		s = GraphUtils.getNodeFromSpecs({ id: 3, data: { x: 4 }, labels: ["A", "B"] });
		expect(s.id || null).not.toBeNull();
		expect(s.typeName).toEqual("Thing");
	});
});
