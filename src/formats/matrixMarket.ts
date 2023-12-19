import { Utils } from "@orbifold/utils";
import _ from "lodash";
import {JsonGraph} from "../formats/jsonGraph";

/*
 * Also known as the MTX format
 * See https://math.nist.gov/MatrixMarket/formats.html#MMformat
 * */
export   class MatrixMarket {
	static parse(data) {
		if (Utils.isEmpty(data)) {
			return null;
		}

		if (_.isString(data)) {
			data = data
				.split("\n")
				.map((l) => l.trim())
				.filter((l) => l.length > 0);
			return MatrixMarket.parse(data);
		} else if (_.isArray(data)) {
			const header = data.shift();
			if (header.indexOf("%MatrixMarket") < 0) {
				throw new Error("Probably not an MTX format.");
			}
			// next line is the size of the matrix
			data.shift();
			const g = JsonGraph.empty();

			for (let i = 0; i < data.length; i++) {
				const [s, t] = data[i].split(" ");
				JsonGraph.addNode(g, s);
				JsonGraph.addNode(g, t);
				JsonGraph.addEdge(g, [s.toString().trim(), t.toString().trim()]);
			}
			return g;
		} else {
			throw new Error("The MatrixMarket input could not be interpreted.");
		}
	}
}
