import _ from "lodash";
import { Utils } from "@orbifold/utils";

export   class TreeNode {
	/**
	 * The parent node. If null this is the root.
	 * @type TreeNode
	 */
	parentNode = null;
	/**
	 * The payload.
	 * @type {*}
	 */
	value = null;

	/**
	 * The tree this node belongs to.
	 * @type Tree
	 */
	tree = null;

	/**
	 * The children of this node.
	 * @type {TreeNode[]}
	 */
	children = [];

	/**
	 * The unique id of this node.
	 * @type {string}
	 */
	id = Utils.id();

	/**
	 * Instantiates a new TreeNode.
	 * @param value {*|null} The payload.
	 * @param parentNode {*|TreeNode} The parent of this new node.
	 * @param tree
	 */
	constructor(value = null, parentNode = null, tree = null) {
		this.value = value;
		this.children = [];
		this.tree = tree;
		if (!_.isNil(parentNode)) {
			if (parentNode instanceof TreeNode) {
				this.parentNode = parentNode;
				parentNode.appendChild(this);
			} else {
				if (this.tree == null) {
					throw new Error("A parent node should be a TreeNode.");
				} else {
					const foundParent = this.tree.find((n) => n.value === parentNode);
					if (foundParent) {
						this.parentNode = foundParent;
						foundParent.appendChild(this);
					}
				}
			}
		}
	}

	/**
	 * This node is a root if it has no parent.
	 */
	get isRoot() {
		return _.isNil(this.parentNode);
	}

	/**
	 * This node is a leaf if it has no children.
	 */
	get isLeaf() {
		return this.children.length === 0;
	}

	get hasChildren() {
		return this.children.length > 0;
	}

	/**
	 * Appends the node or the new node created from the given data.
	 * The appended child is returned.
	 * @param child {any|TreeNode} The payload of the new node to add or the tree node.
	 * @return {TreeNode<IId> | TreeNode<any>}
	 */
	appendChild(child) {
		if (child instanceof TreeNode) {
			if (this.tree) {
				if (child.tree != null && this.tree !== child.tree) {
					throw new Error("The given child node already belongs to another tree.");
				}
			}
			if (this.childValueExists(child.value)) {
				throw new Error(`Child with id '${child.value.id}' is already present.`);
			}
			if (!_.isNil(child.parentNode)) {
				child.parentNode.removeChild(child);
			}
			child.parentNode = this;
			child.tree = this.tree;
			this.children.push(child);
			return child;
		} else {
			if (this.childValueExists(child)) {
				throw new Error(`Child with given value already present.`);
			}
			// note that we don't check whether the id is not elsewhere present in the tree or forest
			return new TreeNode(child, this, this.tree);
		}
	}

	/**
	 * Removes the child from this node.
	 * @param child
	 * @return {TreeNode<IId> | TreeNode<D>}
	 */
	removeChild(child) {
		if (child instanceof TreeNode) {
			const index = this.children.indexOf(child);
			if (index < 0) {
				return null;
			}
			this.children.splice(index, 1);
			child.parentNode = null;
			return child;
		} else {
			if (!this.childValueExists(child)) {
				return null;
			}
			const node = this.getChild(child);
			this.removeChild(node);
			return node;
		}
	}

	childValueExists(value) {
		return this.children.filter((c) => c.value === value).length > 0;
	}

	/**
	 * Returns true if the given node or value is among the children of this node.
	 * @param node {*|TreeNode} A node or a value.
	 * @returns {boolean}
	 */
	hasChild(node) {
		if (_.isNil(node)) {
			throw new Error("Cannot test nil child.");
		}
		if (node instanceof TreeNode) {
			return this.children.indexOf(node) > -1;
		} else {
			return !_.isNil(this.children.find((n) => n.value === node));
		}
	}

	/**
	 * Returns the (first) child with the specified value.
	 * @param value {*} Anything
	 * @returns {*}
	 */
	getChild(value) {
		return this.children.find((c) => c.value === value);
	}

	toJSON() {
		// calls toJSON if present
		const json = {
			typeName: "TreeNode",
			value: JSON.parse(JSON.stringify(this.value)),
			children: [],
			id: this.id,
		};
		this.children.forEach((child) => json.children.push(child.toJSON()));
		return json;
	}

	static fromJSON(json) {
		if (Utils.isEmpty(json)) {
			return null;
		}
		if (json.typeName !== "TreeNode") {
			throw new Error(`Wrong deserialization data: ${json.typeName} passed to TreeNode.`);
		}
		// no pointers to parent or tree here
		let v = null;
		if (_.isString(json.value)) {
			v = json.value;
		} else {
			v = JSON.parse(json.value);
		}
		this.id = json.id || Utils.id();

		const node = new TreeNode(v, null, null);
		if (json.children && json.children.length > 0) {
			json.children.forEach((child) => {
				try {
					const n = TreeNode.fromJSON(child);
					if (n) {
						node.children.push(n);
					}
				} catch (e) {
					//
				}
			});
		}
		return node;
	}
}
