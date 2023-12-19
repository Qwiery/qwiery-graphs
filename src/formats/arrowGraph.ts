import { Utils,Strings } from "@orbifold/utils";
import _ from 'lodash';
import {JsonGraph} from './jsonGraph';

/*
 * Utilities related to the arrow format
 **/
export   class ArrowGraph {
    /**
     * Returns a JSON-graph from the given arrow-formatted graph.
     * @param input
     * @returns {{nodes: *[], edges: *[]}}
     */
    static parse(input) {
        const g = JsonGraph.empty();
        const getEdgeList = (data) => {
            const lines = data.trim().split('\n');
            let total = [];
            for (const line of lines) {
                let ar = [];
                const sequence = line
                    .split('->')
                    .map((u) => u.trim())
                    .filter((u) => u.length > 0);

                if (sequence.length === 0) {
                    continue;
                } else if (sequence.length === 1) {
                    ar.push([sequence[0]]);
                } else {
                    for (let i = 0; i < sequence.length - 1; i++) {
                        ar.push([sequence[i], sequence[i + 1]]);
                    }
                }
                total = total.concat(ar);
            }
            return total;
        };
        if (Utils.isEmpty(input)) {
            return g;
        }
        let edgeList;
        if (_.isArray(input)) {
            for (let item of input) {
                item = item.toString();
                edgeList = getEdgeList(item);
                edgeList.forEach((u) => {
                    if (u.length === 1) {
                        JsonGraph.addNode(g, u[0]);
                    } else {
                        JsonGraph.addEdge(g, u);
                    }
                });
            }
            return g;
        } else if (_.isString(input)) {
            edgeList = getEdgeList(input);
            edgeList.forEach((u) => {
                if (u.length === 1) {
                    JsonGraph.addNode(g, u[0]);
                } else {
                    JsonGraph.addEdge(g, u);
                }
            });
            return g;
        } else {
            throw new Error(Strings.ShouldBeType('fromArrows', 'string or string array', 'Graph.fromArrows'));
        }
    }
}
