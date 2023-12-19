import _ from 'lodash';
import { Utils } from "@orbifold/utils";

import {Tree} from './tree';

export   class Forest {
    /**
     *
     * @type {Tree[]}
     */
    #trees = [];

    /**
     * Instantiates a new forest.
     * @param items {Tree|Tree[]} One or more trees.
     */
    constructor(items = null) {
        if (items instanceof Tree) {
            this.#trees = [items];
        } else if (_.isArray(items)) {
            this.#trees = items.filter((u) => u instanceof Tree);
        } else {
            this.#trees = [];
        }
    }

    /**
     * Returns the trees in this forest.
     * @returns {Tree[]}
     */
    get trees() {
        return this.#trees;
    }

    /**
     * Returns the roots of this forest.
     * @returns {TreeNode[]}
     */
    get roots() {
        return this.#trees.map((t) => t.root);
    }

    hasTree(tree) {
        if (_.isNil(tree)) {
            return false;
        }
        if (!(tree instanceof Tree)) {
            throw new Error('The given object is not a tree.');
        }
        return this.#trees.indexOf(tree) > -1;
    }

    /**
     * Returns a forest with this single tree in it.
     * @return {Forest}
     */
    static fromTree(tree) {
        const forest = new Forest();
        forest.appendTree(tree);
        return forest;
    }

    /**
     * Returns all the nodes in this forest.
     * That is, all the nodes in all the trees of all levels.
     * @return {TreeNode[]}
     */
    get nodes() {
        let coll = [];
        this.trees.forEach((tree) => {
            coll = coll.concat(tree.nodes);
        });
        return coll;
    }

    /**
     * Creates a forest from the given roots.
     * @param roots {TreeNode<any>[]}
     * @return {Forest}
     */
    static fromRoots(roots:any=null) {
        const forest = new Forest();
        if (_.isNil(roots) || roots.length === 0) {
            return forest;
        }

        const trees = roots.filter((r) => !_.isNil(r)).map((root) => new Tree(root));
        trees.forEach((tree) => forest.appendTree(tree));
        return forest;
    }

    hasNode(node) {
        return !_.isNil(this.find((n) => n === node));
    }

    find(predicate) {
        for (let i = 0; i < this.trees.length; i++) {
            const tree = this.trees[i];
            const found = tree.find(predicate);
            if (!_.isNil(found)) {
                return found;
            }
        }
        return null;
    }

    findByValue(value) {
        for (let i = 0; i < this.trees.length; i++) {
            const found = this.trees[i].findByValue(value);
            if (!_.isNil(found)) {
                return found;
            }
        }
        return null;
    }

    /**
     * Fetches the leaf nodes of this forest.
     */
    getLeafNodes() {
        let coll = [];
        this.#trees.forEach((tree) => {
            coll = coll.concat(tree.getLeafNodes());
        });
        return coll;
    }

    appendTree(tree) {
        const found = this.#trees.find((t) => t === tree);
        if (!_.isNil(found)) {
            throw new Error('The forest already contains this tree.');
        }
        this.#trees.push(tree);
    }

    dft(visitor) {
        this.trees.forEach((r) => {
            r.dft(visitor);
        });
    }

    toJSON() {
        return {
            typeName: 'Forest',
            trees: this.trees.map((tree) => tree.toJSON()),
        };
    }

    get typeName() {
        return 'Forest';
    }

    /**
     * Deserializes the given forest.
     * @param json {*} A serialized forest.
     * @returns {Forest|null}
     */
    static fromJSON(json) {
        if (Utils.isEmpty(json)) {
            return null;
        }
        if (json.typeName !== 'Forest') {
            throw new Error(`Wrong deserialization data: ${json.typeName} passed to Forest.`);
        }

        return new Forest((json.trees || []).map((tree) => Tree.fromJSON(tree)));
    }
}
