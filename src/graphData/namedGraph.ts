import { Utils,Strings } from "@orbifold/utils";
import {Graph} from '../graph';
import _ from 'lodash';

export   class NamedGraph {
    /**
     * Returns the complete graph (K_n) of the specified size.
     * @param [size=10] {number} The size of the graph
     * @returns {Graph}
     */
    static complete(size = 10) {
        if (Utils.isEmpty(size)) {
            throw new Error(Strings.IsNil('size', 'NamedGraph.complete'));
        }
        if (!Utils.isInteger(size)) {
            throw new Error(Strings.ShouldBeType('size', 'number', 'NamedGraph.complete'));
        }
        // would give more than 5000 edges
        if (size > 100) {
            throw new Error('The complete graph with more than 100 nodes is too large.');
        }
        const g = Graph.empty();
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== j) {
                    g.addEdge(i, j);
                }
            }
        }
        return g;
    }

    /**
     * Returns a path graph.
     * @param [size=10] The size of the path.
     * @returns {Graph}
     */
    static path(size = 10) {
        if (Utils.isEmpty(size)) {
            throw new Error(Strings.IsNil('size', 'NamedGraph.complete'));
        }
        if (!Utils.isInteger(size)) {
            throw new Error(Strings.ShouldBeType('size', 'number', 'NamedGraph.complete'));
        }
        // would give more than 5000 edges
        if (size > 1000) {
            throw new Error('The chain with more than 1000 nodes is too large.');
        }
        const g = Graph.empty();
        if (size === 0) {
            return g;
        }
        if (size === 1) {
            g.addNode('1');
            return g;
        }
        for (let i = 0; i < size - 1; i++) {
            g.addEdge(i, i + 1);
        }
        return g;
    }

    /**
     * Zachary's karate club is a social network of a university karate club, described in the paper
     * *"An Information Flow Model for Conflict and Fission in Small Groups"* by Wayne W. Zachary.
     * @see https://en.wikipedia.org/wiki/Zachary%27s_karate_club
     */
    static karateClub() {
        const nodes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
        const edges = [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [0, 6],
            [0, 7],
            [0, 8],
            [0, 10],
            [0, 11],
            [0, 12],
            [0, 13],
            [0, 17],
            [0, 19],
            [0, 21],
            [0, 31],
            [1, 2],
            [1, 3],
            [1, 7],
            [1, 13],
            [1, 17],
            [1, 19],
            [1, 21],
            [1, 30],
            [2, 3],
            [2, 7],
            [2, 8],
            [2, 9],
            [2, 13],
            [2, 27],
            [2, 28],
            [2, 32],
            [3, 7],
            [3, 12],
            [3, 13],
            [4, 6],
            [4, 10],
            [5, 6],
            [5, 10],
            [5, 16],
            [6, 16],
            [8, 30],
            [8, 32],
            [8, 33],
            [9, 33],
            [13, 33],
            [14, 32],
            [14, 33],
            [15, 32],
            [15, 33],
            [18, 32],
            [18, 33],
            [19, 33],
            [20, 32],
            [20, 33],
            [22, 32],
            [22, 33],
            [23, 25],
            [23, 27],
            [23, 29],
            [23, 32],
            [23, 33],
            [24, 25],
            [24, 27],
            [24, 31],
            [25, 31],
            [26, 29],
            [26, 33],
            [27, 33],
            [28, 31],
            [28, 33],
            [29, 32],
            [29, 33],
            [30, 32],
            [30, 33],
            [31, 32],
            [31, 33],
            [32, 33],
        ];
        return NamedGraph.createGraphFrom(nodes, edges);
    }

    /**
     * The Davis Southern Women network from
     * "A. Davis, Gardner, B. B., Gardner, M. R., 1941. Deep South. University of Chicago Press, Chicago, IL."
     * See https://press.uchicago.edu/ucp/books/book/chicago/D/bo177425440.html
     * @returns {Graph}
     * @constructor
     */
    static DavisSouthernWomen() {
        const nodes = [
            'Evelyn Jefferson',
            'Laura Mandeville',
            'Theresa Anderson',
            'Brenda Rogers',
            'Charlotte McDowd',
            'Frances Anderson',
            'Eleanor Nye',
            'Pearl Oglethorpe',
            'Ruth DeSand',
            'Verne Sanderson',
            'Myra Liddel',
            'Katherina Rogers',
            'Sylvia Avondale',
            'Nora Fayette',
            'Helen Lloyd',
            'Dorothy Murchison',
            'Olivia Carleton',
            'Flora Price',
            'E1',
            'E2',
            'E3',
            'E4',
            'E5',
            'E6',
            'E7',
            'E8',
            'E9',
            'E10',
            'E11',
            'E12',
            'E13',
            'E14',
        ];
        const edges = [
            ['Evelyn Jefferson', 'E1'],
            ['Evelyn Jefferson', 'E2'],
            ['Evelyn Jefferson', 'E3'],
            ['Evelyn Jefferson', 'E4'],
            ['Evelyn Jefferson', 'E5'],
            ['Evelyn Jefferson', 'E6'],
            ['Evelyn Jefferson', 'E8'],
            ['Evelyn Jefferson', 'E9'],
            ['Laura Mandeville', 'E1'],
            ['Laura Mandeville', 'E2'],
            ['Laura Mandeville', 'E3'],
            ['Laura Mandeville', 'E5'],
            ['Laura Mandeville', 'E6'],
            ['Laura Mandeville', 'E7'],
            ['Laura Mandeville', 'E8'],
            ['Theresa Anderson', 'E2'],
            ['Theresa Anderson', 'E3'],
            ['Theresa Anderson', 'E4'],
            ['Theresa Anderson', 'E5'],
            ['Theresa Anderson', 'E6'],
            ['Theresa Anderson', 'E7'],
            ['Theresa Anderson', 'E8'],
            ['Theresa Anderson', 'E9'],
            ['Brenda Rogers', 'E1'],
            ['Brenda Rogers', 'E3'],
            ['Brenda Rogers', 'E4'],
            ['Brenda Rogers', 'E5'],
            ['Brenda Rogers', 'E6'],
            ['Brenda Rogers', 'E7'],
            ['Brenda Rogers', 'E8'],
            ['Charlotte McDowd', 'E3'],
            ['Charlotte McDowd', 'E4'],
            ['Charlotte McDowd', 'E5'],
            ['Charlotte McDowd', 'E7'],
            ['Frances Anderson', 'E3'],
            ['Frances Anderson', 'E5'],
            ['Frances Anderson', 'E6'],
            ['Frances Anderson', 'E8'],
            ['Eleanor Nye', 'E5'],
            ['Eleanor Nye', 'E6'],
            ['Eleanor Nye', 'E7'],
            ['Eleanor Nye', 'E8'],
            ['Pearl Oglethorpe', 'E6'],
            ['Pearl Oglethorpe', 'E8'],
            ['Pearl Oglethorpe', 'E9'],
            ['Ruth DeSand', 'E5'],
            ['Ruth DeSand', 'E7'],
            ['Ruth DeSand', 'E8'],
            ['Ruth DeSand', 'E9'],
            ['Verne Sanderson', 'E7'],
            ['Verne Sanderson', 'E8'],
            ['Verne Sanderson', 'E9'],
            ['Verne Sanderson', 'E12'],
            ['Myra Liddel', 'E8'],
            ['Myra Liddel', 'E9'],
            ['Myra Liddel', 'E10'],
            ['Myra Liddel', 'E12'],
            ['Katherina Rogers', 'E8'],
            ['Katherina Rogers', 'E9'],
            ['Katherina Rogers', 'E10'],
            ['Katherina Rogers', 'E12'],
            ['Katherina Rogers', 'E13'],
            ['Katherina Rogers', 'E14'],
            ['Sylvia Avondale', 'E7'],
            ['Sylvia Avondale', 'E8'],
            ['Sylvia Avondale', 'E9'],
            ['Sylvia Avondale', 'E10'],
            ['Sylvia Avondale', 'E12'],
            ['Sylvia Avondale', 'E13'],
            ['Sylvia Avondale', 'E14'],
            ['Nora Fayette', 'E6'],
            ['Nora Fayette', 'E7'],
            ['Nora Fayette', 'E9'],
            ['Nora Fayette', 'E10'],
            ['Nora Fayette', 'E11'],
            ['Nora Fayette', 'E12'],
            ['Nora Fayette', 'E13'],
            ['Nora Fayette', 'E14'],
            ['Helen Lloyd', 'E7'],
            ['Helen Lloyd', 'E8'],
            ['Helen Lloyd', 'E10'],
            ['Helen Lloyd', 'E11'],
            ['Helen Lloyd', 'E12'],
            ['Dorothy Murchison', 'E8'],
            ['Dorothy Murchison', 'E9'],
            ['Olivia Carleton', 'E9'],
            ['Olivia Carleton', 'E11'],
            ['Flora Price', 'E9'],
            ['Flora Price', 'E11'],
        ];
        return NamedGraph.createGraphFrom(nodes, edges);
    }

    /**
     * Creates a graph consisting of only nodes.
     * @param size {number} The amount of nodes to create.
     * @returns {Graph}
     */
    static singletons(size) {
        const g = Graph.empty();
        _.range(size).forEach((i) => g.addNode(i));
        return g;
    }

    static createGraphFrom(nodes, edges) {
        const g = Graph.empty();
        nodes.forEach((i) => g.addNode(i.toString(), i.toString()));
        edges.forEach((e) => g.addEdge(e));
        return g;
    }
}
