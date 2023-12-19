import { describe, test, it, expect } from "vitest";

import {JsonGraph} from "../src/formats/jsonGraph";

import _ from "lodash";

describe("JsonGraph", function () {
	it("should detect the format", function () {
		expect(JsonGraph.isJsonGraph([])).toBeFalsy();
		expect(JsonGraph.isJsonGraph(44)).toBeFalsy();
		expect(JsonGraph.isJsonGraph({})).toBeFalsy();
		expect(JsonGraph.isJsonGraph({ nodes: [] })).toBeFalsy();
		expect(JsonGraph.isJsonGraph({ nodes: [], Edges: {} })).toBeFalsy();
		expect(JsonGraph.isJsonGraph({ nodes: [], edges: {} })).toBeFalsy();
		expect(JsonGraph.isJsonGraph({ nodes: [], edges: [] })).toBeTruthy();
	});
	it("should merge JSON graphs", function () {
		const g = {
			nodes: [{ id: "a" }, { id: "b" }],
			edges: [{ sourceId: "a", targetId: "b" }],
		};
		const h1 = {
			nodes: [{ id: "b" }, { id: "c" }],
			edges: [{ sourceId: "b", targetId: "c" }],
		};
		const h2 = {
			nodes: [{ id: "a" }, { id: "b" }],
			edges: [{ sourceId: "a", targetId: "b", typeName: "K" }],
		};
		let m = JsonGraph.mergeJsonGraphs(g, h1);
		expect(m.nodes.length).toEqual(3);
		expect(m.edges.length).toEqual(2);

		m = JsonGraph.mergeJsonGraphs(g, h2);
		expect(m.nodes.length).toEqual(2);
		expect(m.edges.length).toEqual(2);
		// console.log(JSON.stringify(m))
		expect(() => JsonGraph.mergeJsonGraphs(4, 5)).toThrow(Error);
		expect(() => JsonGraph.mergeJsonGraphs([], {})).toThrow(Error);
	});
});
