import {describe, test, it, expect} from 'vitest'

import {Forest} from "../src/forest";
import {TreeNode} from "../src/treeNode";
import {Tree} from "../src/tree";

describe('Trees', function () {
    it('should do the basics', function () {
        let tree = new Tree({a: 3});
        expect(tree.root).not.toBeNull();
        expect(tree.root.value).toEqual({a: 3});
        expect(tree.isEmpty).toBeFalsy()
        expect(tree.size).toEqual(1);
        // there is already a root
        expect(() => tree.appendChild("b")).toThrow(Error);
        // but if no root this will set it
        tree = new Tree();
        expect(() => tree.appendChild("b")).not.toThrow(Error);
        // value exists already
        expect(() => tree.appendChild("b")).toThrow(Error);
        expect(tree.root.tree).toEqual(tree);
        expect(tree.root.value).toEqual("b");
        let cnode = tree.appendChild("c", tree.root);
        expect(cnode.tree).toEqual(tree)
        expect(tree.size).toEqual(2)
        expect(tree.root.isLeaf).toBeFalsy();
        expect(tree.root.hasChildren).toBeTruthy();
        let found = tree.find(n => n.value === "c")
        expect(found).not.toBeNull()
        found = tree.root.getChild("c");
        expect(found.value).toEqual("c");
        expect(tree.root.hasChild("c")).toBeTruthy()
        expect(tree.root.hasChild(cnode)).toBeTruthy()
        expect(tree.root.isRoot).toBeTruthy()
        expect(cnode.isRoot).not.toBeTruthy()
        let leafs = tree.getLeafNodes();
        expect(leafs).toHaveLength(1)
        expect(leafs[0].value).toEqual("c")

        tree.root.removeChild("c")
        found = tree.findByValue("c")
        expect(found).toBeNull()
        expect(tree.root.hasChild("c")).toBeFalsy();
        expect(tree.hasNode("c")).toBeFalsy();
        expect(tree.hasNode("b")).toBeTruthy();

        let t2 = new Tree("r2");
        let n2 = t2.appendChild("k", "r2")
        expect(() => tree.root.appendChild(n2)).toThrow(Error)

        n2.appendChild("4")
        // already there
        expect(() => n2.appendChild("4")).toThrow(Error)
        expect(n2.toJSON().value).toEqual("k")
        expect(n2.toJSON().children).toHaveLength(1)
    });

    it('should (de)serialize tree nodes', function () {
        const n1 = new TreeNode("a");
        let json = n1.toJSON();
        expect(TreeNode.fromJSON(json).value).toEqual("a")
        n1.appendChild("b")
        json = n1.toJSON();
        let m1 = TreeNode.fromJSON(json)
        expect(m1.value).toEqual("a")
        expect(m1.children).toHaveLength(1)
        expect(m1.children[0].value).toEqual("b");

    });

    it('should (de)serialize a tree', function () {
        let t = new Tree("a")
        let b = t.root.appendChild("b")
        let c = b.appendChild("c")
        let json:any = t.toJSON()
        let t2 = Tree.fromJSON(json)
        expect(t2.nodes).toHaveLength(3)
        expect(t2.nodes.map(n => n.value)).toEqual(["a", "b", "c"]);

        // a forest
        let f = t.toForest()
        json = f.toJSON();
        let f2 = Forest.fromJSON(json);
        expect(f2.trees).toHaveLength(1)
        expect(f2.nodes).toHaveLength(3)
        expect(Forest.fromJSON(null)).toBeNull()
    });

    it('should manage a forest', function () {
        let t1 = new Tree("r1");
        let t2 = new Tree("r2");
        let f1 = t1.toForest();
        expect(f1).toBeInstanceOf(Forest)
        expect(f1.roots).toHaveLength(1)

        f1.appendTree(t2);
        expect(() => f1.appendTree(t2)).toThrow(Error);
        expect(f1.trees).toHaveLength(2)
        expect(f1.getLeafNodes()).toHaveLength(2);
        expect(f1.getLeafNodes().map(n => n.value)).toEqual(["r1", "r2"]);
        t1.root.appendChild("c1")
        expect(f1.getLeafNodes().map(n => n.value)).toEqual(["c1", "r2"]);
        expect(f1.findByValue("k")).toBeNull()
        expect(f1.findByValue("c1")).not.toBeNull()
        expect(f1.find(n => n.value === "r1").value).toEqual("r1")
        expect(f1.nodes).toHaveLength(3)
        // a tree can be in multiple forests
        let f2 = Forest.fromTree(t1)
        expect(f1.hasTree(t1)).toBeTruthy()
        expect(f2.hasTree(t1)).toBeTruthy()
        expect(f2.hasTree(null)).not.toBeTruthy()
        expect(() => f2.hasTree({a: "4"})).toThrow(Error)
        expect(f1.hasNode(t1.root)).toBeTruthy()
        expect(f2.hasNode(t1.root)).toBeTruthy()

        t1.toJSON()

        expect(Forest.fromRoots()).toBeInstanceOf(Forest)


    });
});
