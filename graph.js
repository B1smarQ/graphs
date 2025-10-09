class Graph {
    constructor() {
        this.nodes = new Map(); // id -> node data
        this.edges = new Map(); // id -> edge data
        this.adjacencyList = new Map(); // node id -> array of connected node ids
        this.edgeMap = new Map(); // Map to store edges between nodes
    }

    // Add a node to the graph
    addNode(id, label = '') {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, label });
            this.adjacencyList.set(id, []);
            return true;
        }
        return false;
    }

    // Remove a node from the graph
    removeNode(id) {
        if (!this.nodes.has(id)) return false;

        // Remove all edges connected to this node
        this.adjacencyList.get(id).forEach(neighborId => {
            this.removeEdge(id, neighborId);
        });

        // Remove the node
        this.nodes.delete(id);
        this.adjacencyList.delete(id);
        return true;
    }

    // Add an edge to the graph
    addEdge(sourceId, targetId, weight = null, directed = false) {
        if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
            return false;
        }

        const edgeId = `${sourceId}-${targetId}`;
        this.edges.set(edgeId, {
            id: edgeId,
            source: sourceId,
            target: targetId,
            weight: weight,
            directed: directed
        });

        // Update adjacency list
        if (!this.adjacencyList.get(sourceId).includes(targetId)) {
            this.adjacencyList.get(sourceId).push(targetId);
        }

        if (!directed) {
            if (!this.adjacencyList.get(targetId).includes(sourceId)) {
                this.adjacencyList.get(targetId).push(sourceId);
            }
        }

        // Update edge map
        if (!this.edgeMap.has(sourceId)) {
            this.edgeMap.set(sourceId, new Map());
        }
        if (!this.edgeMap.has(targetId)) {
            this.edgeMap.set(targetId, new Map());
        }

        this.edgeMap.get(sourceId).set(targetId, edgeId);
        if (!directed) {
            this.edgeMap.get(targetId).set(sourceId, edgeId);
        }

        return true;
    }

    // Remove an edge from the graph
    removeEdge(sourceId, targetId) {
        const edgeId = `${sourceId}-${targetId}`;
        const reverseEdgeId = `${targetId}-${sourceId}`;

        // Remove from edges map
        this.edges.delete(edgeId);
        this.edges.delete(reverseEdgeId);

        // Update adjacency list
        const sourceNeighbors = this.adjacencyList.get(sourceId);
        const targetNeighbors = this.adjacencyList.get(targetId);

        if (sourceNeighbors) {
            const index = sourceNeighbors.indexOf(targetId);
            if (index > -1) {
                sourceNeighbors.splice(index, 1);
            }
        }

        if (targetNeighbors) {
            const index = targetNeighbors.indexOf(sourceId);
            if (index > -1) {
                targetNeighbors.splice(index, 1);
            }
        }

        // Update edge map
        if (this.edgeMap.has(sourceId) && this.edgeMap.get(sourceId).has(targetId)) {
            this.edgeMap.get(sourceId).delete(targetId);
        }

        if (this.edgeMap.has(targetId) && this.edgeMap.get(targetId).has(sourceId)) {
            this.edgeMap.get(targetId).delete(sourceId);
        }

        return true;
    }

    // Get neighbors of a node
    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }

    // Check if the graph is connected
    isConnected() {
        if (this.nodes.size === 0) return true;
        if (this.nodes.size === 1) return true;

        const visited = new Set();
        const startNode = this.nodes.keys().next().value;
        this.dfs(startNode, visited);

        return visited.size === this.nodes.size;
    }

    // Depth-first search
    dfs(startNode, visited = new Set()) {
        visited.add(startNode);
        const neighbors = this.getNeighbors(startNode);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.dfs(neighbor, visited);
            }
        }

        return visited;
    }

    // Calculate the degree of a node
    getDegree(nodeId) {
        return this.adjacencyList.get(nodeId) ? this.adjacencyList.get(nodeId).length : 0;
    }

    // Check if all nodes have even degree (for Eulerian cycle)
    allNodesHaveEvenDegree() {
        for (const nodeId of this.nodes.keys()) {
            if (this.getDegree(nodeId) % 2 !== 0) {
                return false;
            }
        }
        return true;
    }

    // Check if exactly two nodes have odd degree (for Eulerian path)
    hasExactlyTwoOddDegreeNodes() {
        let oddDegreeCount = 0;
        for (const nodeId of this.nodes.keys()) {
            if (this.getDegree(nodeId) % 2 !== 0) {
                oddDegreeCount++;
            }
        }
        return oddDegreeCount === 2;
    }

    // Check if the graph has an Eulerian cycle
    hasEulerianCycle() {
        return this.isConnected() && this.allNodesHaveEvenDegree();
    }

    // Check if the graph has an Eulerian path
    hasEulerianPath() {
        return this.isConnected() && (this.allNodesHaveEvenDegree() || this.hasExactlyTwoOddDegreeNodes());
    }

    // Find Eulerian path/cycle using Hierholzer's algorithm
    findEulerianPath() {
        if (!this.hasEulerianPath()) {
            return null;
        }

        // For Eulerian cycle, start at any vertex
        // For Eulerian path, start at one of the odd-degree vertices
        let startVertex = null;
        if (this.hasEulerianCycle()) {
            startVertex = this.nodes.keys().next().value;
        } else {
            // Find a vertex with odd degree
            for (const nodeId of this.nodes.keys()) {
                if (this.getDegree(nodeId) % 2 !== 0) {
                    startVertex = nodeId;
                    break;
                }
            }
        }

        if (!startVertex) return null;

        // Create a copy of the adjacency list for traversal
        const tempAdjList = new Map();
        for (const [nodeId, neighbors] of this.adjacencyList.entries()) {
            tempAdjList.set(nodeId, [...neighbors]);
        }

        const path = [];
        const stack = [startVertex];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = tempAdjList.get(current);

            if (neighbors && neighbors.length > 0) {
                const next = neighbors.pop();
                // Remove the edge in both directions (for undirected graph)
                const nextNeighbors = tempAdjList.get(next);
                if (nextNeighbors) {
                    const index = nextNeighbors.indexOf(current);
                    if (index > -1) {
                        nextNeighbors.splice(index, 1);
                    }
                }
                stack.push(next);
            } else {
                path.push(stack.pop());
            }
        }

        return path.reverse();
    }

    // Calculate shortest path using Dijkstra's algorithm
    dijkstra(startNode, endNode) {
        if (!this.nodes.has(startNode) || !this.nodes.has(endNode)) {
            return null;
        }

        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const unvisited = [];

        // Initialize distances
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, nodeId === startNode ? 0 : Infinity);
            unvisited.push(nodeId);
        }

        while (unvisited.length > 0) {
            // Find node with minimum distance
            unvisited.sort((a, b) => distances.get(a) - distances.get(b));
            const current = unvisited.shift();

            if (current === endNode) {
                break;
            }

            visited.add(current);

            // Update distances to neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;

                // Get edge weight
                const edgeId = `${current}-${neighbor}`;
                const reverseEdgeId = `${neighbor}-${current}`;
                let weight = 1; // Default weight

                if (this.edges.has(edgeId) && this.edges.get(edgeId).weight !== null) {
                    weight = this.edges.get(edgeId).weight;
                } else if (this.edges.has(reverseEdgeId) && this.edges.get(reverseEdgeId).weight !== null) {
                    weight = this.edges.get(reverseEdgeId).weight;
                }

                const alt = distances.get(current) + weight;
                if (alt < distances.get(neighbor)) {
                    distances.set(neighbor, alt);
                    previous.set(neighbor, current);
                }
            }
        }

        // Reconstruct path
        const path = [];
        let currentNode = endNode;

        if (previous.has(endNode) || endNode === startNode) {
            while (currentNode !== undefined) {
                path.unshift(currentNode);
                currentNode = previous.get(currentNode);
            }
        }

        return {
            path: path,
            distance: distances.get(endNode)
        };
    }

    // Calculate eccentricity of a node
    eccentricity(nodeId) {
        if (!this.nodes.has(nodeId)) return -1;

        let maxDistance = 0;
        const distances = new Map();

        // Initialize distances
        for (const id of this.nodes.keys()) {
            distances.set(id, id === nodeId ? 0 : Infinity);
        }

        // BFS to find distances
        const queue = [nodeId];
        const visited = new Set([nodeId]);

        while (queue.length > 0) {
            const current = queue.shift();
            const currentDistance = distances.get(current);
            const neighbors = this.getNeighbors(current);

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    const newDistance = currentDistance + 1;
                    distances.set(neighbor, newDistance);
                    if (newDistance > maxDistance) {
                        maxDistance = newDistance;
                    }
                    queue.push(neighbor);
                }
            }
        }

        return maxDistance === Infinity ? -1 : maxDistance;
    }

    // Calculate radius of the graph
    radius() {
        if (this.nodes.size === 0) return -1;

        let minEccentricity = Infinity;
        for (const nodeId of this.nodes.keys()) {
            const ecc = this.eccentricity(nodeId);
            if (ecc < minEccentricity) {
                minEccentricity = ecc;
            }
        }

        return minEccentricity === Infinity ? -1 : minEccentricity;
    }

    // Calculate diameter of the graph
    diameter() {
        if (this.nodes.size === 0) return -1;

        let maxEccentricity = -1;
        for (const nodeId of this.nodes.keys()) {
            const ecc = this.eccentricity(nodeId);
            if (ecc > maxEccentricity) {
                maxEccentricity = ecc;
            }
        }

        return maxEccentricity;
    }

    // Get connected components
    getConnectedComponents() {
        const components = [];
        const visited = new Set();

        for (const nodeId of this.nodes.keys()) {
            if (!visited.has(nodeId)) {
                const component = [];
                this.dfs(nodeId, visited);
                for (const v of visited) {
                    if (!component.includes(v)) {
                        component.push(v);
                    }
                }
                components.push(component);
            }
        }

        return components;
    }

    // Get number of connected components
    getComponentCount() {
        return this.getConnectedComponents().length;
    }

    // Check if the graph is a tree
    isTree() {
        // A tree is connected and has n-1 edges
        return this.isConnected() && this.edges.size === this.nodes.size - 1;
    }

    // Get all node IDs
    getNodeIds() {
        return Array.from(this.nodes.keys());
    }

    // Get all edge IDs
    getEdgeIds() {
        return Array.from(this.edges.keys());
    }

    // Get node data
    getNode(id) {
        return this.nodes.get(id);
    }

    // Get edge data
    getEdge(id) {
        return this.edges.get(id);
    }

    // Update node data
    updateNode(id, label) {
        if (this.nodes.has(id)) {
            this.nodes.get(id).label = label;
            return true;
        }
        return false;
    }

    // Update edge data
    updateEdge(sourceId, targetId, weight, directed) {
        const edgeId = `${sourceId}-${targetId}`;
        if (this.edges.has(edgeId)) {
            this.edges.get(edgeId).weight = weight;
            this.edges.get(edgeId).directed = directed;
            return true;
        }
        return false;
    }
}
