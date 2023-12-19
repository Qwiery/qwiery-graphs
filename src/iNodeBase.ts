import { Strings } from "@orbifold/utils";
import {IId} from "./iid";

/**
 * The minimum requirements for a node.
 * @interface
 */
export   class INodeBase extends IId {

	/**
	 * The (not necessarily unique) name of the node.
	 * @type {string|null}
	 */
	name = null;

	/**
	 * The node type.
	 * This attribute is mostly there for compatibility with the Qwiery Semantic framework.
	 * @type {string}
	 */
	typeName = "Unknown";

	toJSON() {
		throw new Error(Strings.InterfaceMethod());
	}
}

