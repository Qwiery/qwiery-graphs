import _ from 'lodash';

import {Graph} from '../graph';

export   class RandomGraph {
    /**
     * Defines the way the algorithms create a node for a given index.
     * @param i {number} The index of the node.
     * @returns {{ id: string}}
     */
    static nodeCreator = (i) => {
        return { id: i.toString() };
    };

    /**
     * Defines the way the algorithms create an edge for a given edge.
     * @param i {number} Source index.
     * @param j {number} Target index.
     * @returns {{sourceId: string, targetId: string}}
     */
    static edgeCreator = (i, j) => {
        return { sourceId: i.toString(), targetId: j.toString() };
    };

    /**
     * Simple balanced tree
     *
     * @memberof RandomGraph
     * @param {number} childrenCount number of children each node has
     * @param {number} height height of the tree
     */
    static BalancedTree(childrenCount = 3, height = 3) {
        let v = 1;
        const jsonGraph = {
            typeName: 'Graph',
            nodes: [RandomGraph.nodeCreator(0)],
            edges: [],
        };
        let newLeaves = [],
            node,
            leaves;

        for (let i = 0; i < childrenCount; i++) {
            ++v;
            node = RandomGraph.nodeCreator(v - 1);
            jsonGraph.nodes.push(node);
            newLeaves.push(node);
            jsonGraph.edges.push(RandomGraph.edgeCreator(0, v));
        }

        for (let h = 1; h < height; h++) {
            leaves = newLeaves;
            newLeaves = [];
            for (let j = 0; j < leaves.length; j++) {
                for (let i = 0; i < childrenCount; i++) {
                    ++v;
                    node = RandomGraph.nodeCreator(v - 1);
                    newLeaves.push(node);
                    jsonGraph.nodes.push(node);
                    jsonGraph.edges.push(RandomGraph.edgeCreator(leaves[j].id, v - 1));
                }
            }
        }
        return Graph.fromJSON(jsonGraph);
    }

    /**
     * The Erdős–Rényi-Gilbert graph generator. The structure is defined by the fixed probability of having an edge between two nodes.
     * @see https://en.wikipedia.org/wiki/Erdős–Rényi_model
     * @memberof RandomGraph.ErdosRenyi
     * @param nodeCount {number} The number of nodes
     * @param probability {number}  The probability of an edge between two nodes.
     */
    static ErdosRenyiGilbert(nodeCount = 30, probability = 0.2) {
        const jsonGraph = {
            typeName: 'Graph',
            nodes: [],
            edges: [],
        };
        let i, j;
        for (i = 0; i < nodeCount; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            for (j = 0; j < i; j++) {
                if (Math.random() < probability) {
                    jsonGraph.edges.push(i, j);
                }
            }
        }
        return Graph.fromJSON(jsonGraph);
    }

    /**
     * The Erdős–Rényi graph generator. The structure is defined by the fixed amount of edges.
     *
     * @see https://en.wikipedia.org/wiki/Erdős–Rényi_model * @memberof RandomGraph.ErdosRenyi
     * @param {number} nodeCount number of nodes
     * @param {number} edgeCount number of edges
     */
    static ErdosRenyi(nodeCount = 30, edgeCount = 30) {
        const jsonGraph = {
                typeName: 'Graph',
                nodes: [],
                edges: [],
            },
            tmpEdges = [];

        for (let i = 0; i < nodeCount; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            for (let j = i + 1; j < nodeCount; j++) {
                tmpEdges.push(RandomGraph.edgeCreator(i, j));
            }
        }
        // pick m random edges from tmpEdges
        let k = tmpEdges.length - 1;
        for (let i = 0; i < edgeCount; i++) {
            jsonGraph.edges.push(tmpEdges.splice(Math.floor(Math.random() * k), 1)[0]);
            k--;
        }
        return Graph.fromJSON(jsonGraph);
    }

    /**
     * Generates the 'Watts-Strogatz Small World Alpha' model.
     *
     * @see https://en.wikipedia.org/wiki/Watts–Strogatz_model
     * @param n {number}  number of nodes
     * @param k {number}  mean degree (even integer)
     * @param {number} alpha rewiring probability [0..1]
     */
    static WattsStrogatzAlpha(n = 30, k = 6, alpha = 0.54) {
        const jsonGraph = {
            typeName: 'Graph',
            nodes: [],
            edges: [],
        };
        let i, j, edge;
        const p = Math.pow(10, -10);
        let ec = 0;
        const edge_lut = {},
            ids = [],
            nk_half = (n * k) / 2;
        let Rij, sumRij, r, pij;

        for (i = 0; i < n; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            // create a lattice ring structure
            edge = RandomGraph.edgeCreator(i, (i + 1) % n);
            edge_lut[edge.source + '-' + edge.target] = edge;
            jsonGraph.edges.push(edge);
            ec++;
        }
        // Creating n * k / 2 edges
        while (ec < nk_half) {
            for (i = 0; i < n; i++) {
                ids.push(i);
            }
            while (ec < nk_half && ids.length > 0) {
                i = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
                Rij = [];
                sumRij = 0;
                for (j = 0; j < n; j++) {
                    Rij[j] = calculateRij(i, j);
                    sumRij += Rij[j];
                }
                r = Math.random();
                pij = 0;
                for (j = 0; j < n; j++) {
                    if (i !== j) {
                        pij += Rij[j] / sumRij;
                        if (r <= pij) {
                            edge = RandomGraph.edgeCreator(i, j);
                            jsonGraph.edges.push(edge);
                            ec++;
                            edge_lut[edge.source + '-' + edge.target] = edge;
                        }
                    }
                }
            }
        }

        return Graph.fromJSON(jsonGraph);

        function calculateRij(i, j) {
            if (i === j || edge_lut[i + '-' + j]) return 0;
            const mij = calculatemij(i, j);
            if (mij >= k) return 1;
            if (mij === 0) return p;
            return Math.pow(mij / k, alpha) * (1 - p) + p;
        }

        function calculatemij(i, j) {
            let mij = 0,
                l;
            for (l = 0; l < n; l++) {
                if (l !== i && l !== j && edge_lut[i + '-' + l] && edge_lut[j + '-' + l]) {
                    mij++;
                }
            }
            return mij;
        }
    }

    /**
     * Generates the 'Watts-Strogatz Small World Beta' model.
     * @see https://en.wikipedia.org/wiki/Watts–Strogatz_model
     * @memberof RandomGraph.WattsStrogatz
     * @param n {number}  number of nodes
     * @param K {number}  mean degree (even integer)
     * @param {number} beta rewiring probability [0..1]
     */
    static WattsStrogatzBeta(n = 30, K = 6, beta = 0.54) {
        const jsonGraph = {
            typeName: 'Graph',
            nodes: [],
            edges: [],
        };
        let i, j, t, edge;
        const edge_lut = {};
        K = K >> 1; // divide by two
        for (i = 0; i < n; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            // create a lattice ring structure
            for (j = 1; j <= K; j++) {
                edge = RandomGraph.edgeCreator(i, (i + j) % n);
                edge_lut[edge.sourceId + '-' + edge.targetId] = edge;
            }
        }
        // rewiring of edges
        for (i = 0; i < n; i++) {
            for (j = 1; j <= K; j++) {
                // for every pair of nodes
                if (Math.random() <= beta) {
                    do {
                        t = Math.floor(Math.random() * (n - 1));
                    } while (t === i || edge_lut[i + '-' + t]);
                    const j_ = (i + j) % n;
                    edge_lut[i + '-' + j_].targetId = t.toString(); // rewire
                    edge_lut[i + '-' + t] = edge_lut[i + '-' + j_];
                    delete edge_lut[i + '-' + j_];
                }
            }
        }
        jsonGraph.edges.push(..._.values(edge_lut));

        return Graph.fromJSON(jsonGraph);
    }

    /**
     * The Barabási–Albert model generates a scale-free network.
     * @see https://en.wikipedia.org/wiki/Barabási–Albert_model
     * @memberof RandomGraph
     * @param N {number}  total number of nodes  N  > 0
     * @param m0 {number}  m0 > 0 && m0 <  N
     * @param M {number}  M  > 0 && M  <= m0
     */
    static BarabasiAlbert(N = 30, m0 = 5, M = 3) {
        const jsonGraph = {
                typeName: 'Graph',
                nodes: [],
                edges: [],
            },
            edge_lut = {},
            degrees = [];
        let i, j, edge, sum, s, m, r, p;
        // creating m0 nodes
        for (i = 0; i < m0; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            degrees[i] = 0;
        }
        // Linking every node with each other (no self-loops)
        for (i = 0; i < m0; i++) {
            for (j = i + 1; j < m0; j++) {
                edge = RandomGraph.edgeCreator(i, j);
                edge_lut[edge.source + '-' + edge.target] = edge;
                jsonGraph.edges.push(edge);
                degrees[i]++;
                degrees[j]++;
            }
        }
        // Adding N - m0 nodes, each with M edges
        for (i = m0; i < N; i++) {
            jsonGraph.nodes.push(RandomGraph.nodeCreator(i));
            degrees[i] = 0;
            sum = 0; // sum of all nodes degrees
            for (j = 0; j < i; j++) sum += degrees[j];
            s = 0;
            for (m = 0; m < M; m++) {
                r = Math.random();
                p = 0;
                for (j = 0; j < i; j++) {
                    if (edge_lut[i + '-' + j] || edge_lut[j + '-' + i]) continue;
                    if (i === 1) p = 1;
                    else p += degrees[j] / sum + s / (i - m);

                    if (r <= p) {
                        s += degrees[j] / sum;
                        edge = RandomGraph.edgeCreator(i, j);
                        edge_lut[edge.source + '-' + edge.target] = edge;
                        jsonGraph.edges.push(edge);
                        degrees[i]++;
                        degrees[j]++;
                        break;
                    }
                }
            }
        }
        return Graph.fromJSON(jsonGraph);
    }

    /**
     * Creates diverse random and predefined graphs.
     * @param name {string} The name of the graph or generator.
     * @param options {*} Options specific for the type specified.
     * @returns {Graph}
     */
    static create(name = null, options = null) {
        return Graph.create(name, options);
    }
}
