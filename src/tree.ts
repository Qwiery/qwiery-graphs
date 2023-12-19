/*
 * Defines a tree structure.
 * The payload of nodes need to have at least an id field.
 */
import { Utils } from "@orbifold/utils";
import _ from 'lodash';
import {TreeNode} from './treeNode';

import {Forest} from './forest';
import {Nullable} from "vitest";

export   class Tree {
    /**
     * Instantiates a new tree.
     * Pass optionally the root.
     * @param root {any} Either a TreeNode or the payload of the root.
     */
    constructor(root = null) {
        if (_.isNil(root)) {
            this._root = null;
        } else {
            if (root instanceof TreeNode) {
                this._root = root;
            } else {
                this._root = new TreeNode(root, null, this);
            }
        }
    }

    get root() {
        return this._root;
    }

    /**
     * Sets the root of this tree.
     * This will replace existing nodes in this tree.
     * @param v
     */
    set root(v) {
        this._root = v;
    }

    get isEmpty() {
        return _.isNil(this.root);
    }

    /**
     * Returns all the nodes in this tree.
     * @return {any[]}
     */
    get nodes() {
        if (_.isNil(this.root)) {
            return [];
        }
        // cannot use an internal dictionary because child can be added outside the Tree via TreeNode.appendChild
        const coll = [];
        const collector = (n) => coll.push(n);
        this.dft(collector, this.root);
        return coll;
    }

    get nodeCount() {
        return this.nodes.length;
    }

    get size() {
        return this.nodeCount;
    }

    /**
     * Returns whether the given node is part of this tree.
     * @param item {*|TreeNode} A payload or a node.
     * @return {boolean}
     */
    hasNode(item) {
        if (item instanceof TreeNode) {
            return this.root === item;
        }
        return !_.isNil(this.findByValue(item));
    }

    /**
     * Fetches the leaf nodes of this tree.
     */
    getLeafNodes() {
        const coll = [];
        const collector = (n) => {
            if (n.isLeaf) {
                coll.push(n);
            }
        };
        this.dft(collector, this.root);
        return coll;
    }

    /**
     * Finds the node with the specified id.
     * @param value {*} Some payload
     * @return {TreeNode}
     */
    findByValue(value) {
        return this.find((n) => n.value === value);
    }

    /**
     * Finds the node using the given predicate.
     * The search is performed using a DFT.
     * @param predicate
     * @param startNode {TreeNode}
     * @return {TreeNode}
     */
    find(predicate, startNode = null) {
        if (_.isNil(startNode)) {
            startNode = this.root;
        }
        if (!(startNode instanceof TreeNode)) {
            throw new Error('The start node to start the find from should be a TreeNode.');
        }
        return this.findTraverse(startNode, predicate);
    }

    /**
     * Appends the given child to this tree under the given parent.
     * If no parent is specified this will either set the root or raise an error if there already is a root present.
     * @param value {any|TreeNode} Either a value or a TreeNode.
     * @param parent {string|TreeNode} The parent id getting the new child.
     */
    appendChild(value, parent:Nullable<string|TreeNode> = null) {
        if (Utils.isEmpty(parent)) {
            if (this.root == null) {
                this.root = new TreeNode(value, null, this);
                return this.root;
            } else {
                throw new Error('No parent given and there is already a root in this tree.');
            }
        }
        if (_.isNil(parent)) {
            parent = this.root;
        }
        /**
         * @type TreeNode
         */
        const parentNode = parent instanceof TreeNode ? parent : this.findByValue(parent);
        if (_.isNil(parentNode)) {
            throw new Error(`Specified parent does not exist in the tree.`);
        }
        if (value instanceof TreeNode) {
            if (value.tree != null && value.tree !== this) {
                throw new Error('The given child node already belongs to another tree.');
            }
        }
        return parentNode.appendChild(value);
    }

    dft(visitor, startNode = null) {
        if (_.isNil(startNode)) {
            startNode = this.root;
        }
        // happens for empty tree
        if (_.isNil(startNode)) {
            return;
        }
        if (!(startNode instanceof TreeNode)) {
            throw new Error('The start node to start the find from should be a TreeNode.');
        }
        this.dftTraverse(startNode, visitor, 0);
    }

    findTraverse(node, predicate, level = 0) {
        if (predicate(node, level)) {
            return node;
        }
        if (node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                let n = node.children[i];
                const found = this.findTraverse(n, predicate, level + 1);
                if (!_.isNil(found)) {
                    return found;
                }
            }
        }
        return null;
    }

    dftTraverse(node, visitor, level = 0) {
        visitor(node, level);
        if (node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                let n = node.children[i];
                this.dftTraverse(n, visitor, level + 1);
            }
        }
    }

    toForest() {
        return new Forest(this);
    }

    toJSON() {
        return {
            typeName: 'Tree',
            root: this.root.toJSON(),
        };
    }

    static fromJSON(json) {
        if (Utils.isEmpty(json)) {
            return null;
        }
        if (json.typeName !== 'Tree') {
            throw new Error(`Wrong deserialization data: ${json.typeName} passed to Tree.`);
        }
        const tree = new Tree();
        if (json.root) {
            const root = TreeNode.fromJSON(json.root);
            if (root) {
                tree.root = root;
            }
        }
        return tree;
    }
}
