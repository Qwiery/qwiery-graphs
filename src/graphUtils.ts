import _ from "lodash";
import { Utils,Strings } from "@orbifold/utils";
import {Constants} from "./constants";

import { PseudoCypherNode } from "./formats/pseudoCypher";

export   class GraphUtils {
	/**
	 * Handles different cases and returns a plain object accordingly.
	 * Note that this does NOT return a {@link TreeNode}, only the necessary elements to create a node-like object.
	 *
	 * If a plain object is given this will only ensure that there is an id and a typeName, all the other attributes will be kept.
	 * @param nodeSpecs {*} Various cases.
	 * @returns {{name: string, typeName: string, id: string}|{typeName: string, id: string}|{name: null, typeName: string, id: string}|*}
	 */
	static getNodeFromSpecs(...nodeSpecs) {
		// fetch the arguments
		const [count, args] = Utils.getArguments(nodeSpecs);
		let id, name, typeName;
		switch (count) {
			case 0:
				return {
					id: Utils.id(),
					name: null,
					typeName: "Thing",
				};
			case 1:
				let a = args[0];
				if (_.isObject(a) && !_.isPlainObject(a)) {
					return GraphUtils.getNodeFromSpecs(JSON.parse(JSON.stringify(a)));
				} else if (_.isNumber(a)) {
					return {
						id: a.toString(),
						typeName: "Thing",
					};
				} else if (_.isBoolean(a)) {
					return {
						id: a.toString(),
						name: null,
						typeName: "Thing",
					};
				} else if (_.isString(a)) {
					if (Utils.isEmpty(a)) {
						throw new Error("Could not turn the given input into a node definition.");
					}

					const psn = PseudoCypherNode.parse(a);
					if (Utils.isUndefined(psn)) {
						return {
							id: Utils.id(),
							name: a,
							typeName: "Thing",
						};
					}
					const e = psn.toEntity();
					if (Utils.isUndefined(e.id)) {
						e.id = Utils.id();
					}
					if (Utils.isUndefined(e.typeName)) {
						e.typeName = "Thing";
					}
					return e;
				} else if (_.isPlainObject(a)) {
					if (Utils.isDefined(a)) {
						if (Utils.isDefined(a.id) && Utils.isStringOrNumber(a.id)) {
							a.id = a.id.toString().trim();
						} else {
							a.id = Utils.id();
						}
						if (!Utils.isDefined(a.typeName) || !Utils.isStringOrNumber(a.typeName)) {
							a.typeName = "Thing";
						}
						return a;
					}
				}
				break;
			case 2:
				id = args[0];
				name = args[1];
				if (Utils.isStringOrNumber(id)) {
					return {
						id: id.toString().trim(),
						name: name.toString().trim(),
						typeName: "Thing",
					};
				}
				break;
			case 3:
				id = args[0];
				name = args[1];
				typeName = args[2].toString().trim();
				if (Utils.isStringOrNumber(id)) {
					return {
						id: id.toString().trim(),
						name: name.toString().trim(),
						typeName,
					};
				}
				break;
		}
		throw new Error("Could not turn the given input into a node definition.");
	}

	/**
     * Tries to turn the given input into something that can be interpreted as an edge definition.

     *
     * @example
     * // using the helper function
     * const getEdge = (...e) => {
     *            const found = GraphUtils.getEdgeFromSpecs(...e);
     *            return [found.sourceId, found.targetId];
     *        };
     * // all of the following will return ["1","2"]
     * getEdge(1,2);
     * getEdge("1->2");
     * getEdge({sourceId: 1, sourceId:2});
     *
     * @param edgeSpecs {*} An edge specification.
     */
	static getEdgeFromSpecs(...edgeSpecs) {
		const [count, args] = Utils.getArguments(edgeSpecs);
		let source, target, extra;
		switch (count) {
			case 0:
				throw new Error("Could not turn the given input into an edge definition.");
			case 1:
				return GraphUtils.getEdgeFromSpecsOneArgument(args[0]);
			case 2:
				source = args[0];
				target = args[1];
				let sourceId, targetId;
				if (Utils.isStringOrNumber(source)) {
					sourceId = source.toString().trim();
				} else if (Utils.isStringOrNumber(source.id)) {
					sourceId = source.id.toString().trim();
				} else {
					throw new Error("Could not turn the given edge source into a node id.");
				}
				if (Utils.isStringOrNumber(target)) {
					targetId = target.toString().trim();
				} else if (Utils.isStringOrNumber(target.id)) {
					targetId = target.id.toString().trim();
				} else {
					throw new Error("Could not turn the target of the edge into a node id.");
				}
				return {
					sourceId,
					targetId,
					name: null,
					typeName: Constants.GenericLinkTypeName,
				};

			case 3:
				source = args[0];
				target = args[1];
				extra = args[2];
				let edge;
				if (Utils.isStringOrNumber(source) && Utils.isStringOrNumber(target)) {
					edge = {
						sourceId: source.toString(),
						targetId: target.toString(),
						name: null,
						typeName: Constants.GenericLinkTypeName,
					};
				} else {
					throw new Error("Could not turn the given input into an edge definition.");
				}
				if (Utils.isStringOrNumber(extra)) {
					edge.name = extra.toString();
				} else if (_.isPlainObject(extra)) {
					_.assign(edge, extra);
				} else {
					throw new Error("Don't know how to assign the payload to the edge.");
				}
				return edge;
			default:
				throw new Error("Could not turn the given input into an edge definition.");
		}
	}

	/**
	 * Generic equality test for graphs, nodes and edges.
	 * Will also work with number, boolean and string.
	 * @param a {string|number|boolean|*} A string, number, boolean, node, edge or graph.
	 * @param b {string|number|boolean|*} A string, number, boolean, node, edge or graph.
	 * @returns {boolean}
	 */
	static areEqual(a, b) {
		if (Utils.isUndefined(a)) {
			return a === b;
		}
		if (_.isString(a)) {
			return _.isString(b) ? a === b : false;
		} else if (_.isBoolean(a)) {
			return _.isBoolean(b) ? a === b : false;
		} else if (_.isNumber(a)) {
			return _.isNumber(b) ? a === b : false;
		} else if (Utils.isDefined(a.id)) {
			return a.id === b.id;
		} else if (_.isPlainObject(a)) {
			if (Utils.isDefined(a.sourceId)) {
				if (Utils.isDefined(a.targetId)) {
					if (a.sourceId === b.sourceId && a.targetId === b.targetId) {
						let na = Utils.isDefined(a.name) ? a.name.toString().trim().toLowerCase() : null;
						let nb = Utils.isDefined(b.name) ? b.name.toString().trim().toLowerCase() : null;
						return na === nb;
					}
					return false;
				}
				return false;
			}
			// not something which can be interpreted as graph, node or edge
			return false;
		} else {
			return a === b;
		}
	}

	/**
	 *
	 * @param edgeSpecs
	 * @param throwError
	 * @param returnArray
	 * @returns {string[]|{sourceId: string, targetId: string}|null|*[]|{sourceId: string, targetId: string}}
	 */
	static getEdgeFromSpecsOneArgument(edgeSpecs, throwError = true, returnArray = false) {
		if (Utils.isEmpty(edgeSpecs)) {
			if (throwError) {
				throw new Error("Could not turn the given input into an edge definition.");
			}
			return null;
		}
		if (_.isString(edgeSpecs)) {
			// something like 'a->b'
			if (edgeSpecs.indexOf("->") > -1) {
				const parts = edgeSpecs
					.split("->")
					.map((u) => u.trim())
					.filter((u) => u.length > 0);

				if (parts.length === 2) {
					const source = parts[0];
					const target = parts[1];
					if (Utils.isStringOrNumber(source) && Utils.isStringOrNumber(target)) {
						return returnArray
							? [source, target]
							: {
									sourceId: source.toString(),
									targetId: target.toString(),
									typeName: Constants.GenericLinkTypeName,
							  };
					}
				}
			}
		} else if (_.isArray(edgeSpecs)) {
			if (edgeSpecs.length === 2) {
				const source = edgeSpecs[0];
				const target = edgeSpecs[1];
				if (Utils.isStringOrNumber(source) && Utils.isStringOrNumber(target)) {
					return returnArray
						? [source, target]
						: {
								sourceId: source.toString(),
								targetId: target.toString(),
								typeName: "GenericLink",
						  };
				}
			}
		} else if (_.isObject(edgeSpecs) || _.isPlainObject(edgeSpecs)) {
			if (edgeSpecs.sourceId && edgeSpecs.targetId && Utils.isStringOrNumber(edgeSpecs.sourceId) && Utils.isStringOrNumber(edgeSpecs.targetId)) {
				if (returnArray) {
					return [edgeSpecs.sourceId.toString(), edgeSpecs.targetId.toString()];
				} else {
					if (Utils.isUndefined(edgeSpecs.typeName)) {
						edgeSpecs.typeName = "Link";
					}
					if (Utils.isUndefined(edgeSpecs.id)) {
						edgeSpecs.id = Utils.id();
					}
					return edgeSpecs;
				}
			}
		}
		if (throwError) {
			throw new Error("Could not turn the given input into an edge definition.");
		}
		return null;
	}
}
