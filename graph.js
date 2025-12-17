class Graph {
    constructor() {
        this.nodes = new Map(); 
        this.edges = new Map();
        this.adjacencyList = new Map();
        this.edgeMap = new Map(); 
    }

    addNode(id, label = '') {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, label });
            this.adjacencyList.set(id, []);
            return true;
        }
        return false;
    }

    removeNode(id) {
        if (!this.nodes.has(id)) return false;

        this.adjacencyList.get(id).forEach(neighborId => {
            this.removeEdge(id, neighborId);
        });

        this.nodes.delete(id);
        this.adjacencyList.delete(id);
        return true;
    }

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

        if (!this.adjacencyList.get(sourceId).includes(targetId)) {
            this.adjacencyList.get(sourceId).push(targetId);
        }

        if (!directed) {
            if (!this.adjacencyList.get(targetId).includes(sourceId)) {
                this.adjacencyList.get(targetId).push(sourceId);
            }
        }

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

    removeEdge(sourceId, targetId) {
        const edgeId = `${sourceId}-${targetId}`;
        const reverseEdgeId = `${targetId}-${sourceId}`;

        this.edges.delete(edgeId);
        this.edges.delete(reverseEdgeId);

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

        if (this.edgeMap.has(sourceId) && this.edgeMap.get(sourceId).has(targetId)) {
            this.edgeMap.get(sourceId).delete(targetId);
        }

        if (this.edgeMap.has(targetId) && this.edgeMap.get(targetId).has(sourceId)) {
            this.edgeMap.get(targetId).delete(sourceId);
        }

        return true;
    }

    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }

    isConnected() {
        if (this.nodes.size === 0) return true;
        if (this.nodes.size === 1) return true;

        const visited = new Set();
        const startNode = this.nodes.keys().next().value;
        this.dfs(startNode, visited);

        return visited.size === this.nodes.size;
    }

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

    getDegree(nodeId) {
        return this.adjacencyList.get(nodeId) ? this.adjacencyList.get(nodeId).length : 0;
    }

    allNodesHaveEvenDegree() {
        for (const nodeId of this.nodes.keys()) {
            if (this.getDegree(nodeId) % 2 !== 0) {
                return false;
            }
        }
        return true;
    }

    hasExactlyTwoOddDegreeNodes() {
        let oddDegreeCount = 0;
        for (const nodeId of this.nodes.keys()) {
            if (this.getDegree(nodeId) % 2 !== 0) {
                oddDegreeCount++;
            }
        }
        return oddDegreeCount === 2;
    }

    hasEulerianCycle() {
        return this.isConnected() && this.allNodesHaveEvenDegree();
    }

    hasEulerianPath() {
        return this.isConnected() && (this.allNodesHaveEvenDegree() || this.hasExactlyTwoOddDegreeNodes());
    }

    findEulerianPath() {
        if (!this.hasEulerianPath()) {
            return null;
        }

        let startVertex = null;
        if (this.hasEulerianCycle()) {
            startVertex = this.nodes.keys().next().value;
        } else {
            for (const nodeId of this.nodes.keys()) {
                if (this.getDegree(nodeId) % 2 !== 0) {
                    startVertex = nodeId;
                    break;
                }
            }
        }

        if (!startVertex) return null;

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

    dijkstra(startNode, endNode) {
        if (!this.nodes.has(startNode) || !this.nodes.has(endNode)) {
            return null;
        }

        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const unvisited = [];

        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, nodeId === startNode ? 0 : Infinity);
            unvisited.push(nodeId);
        }

        while (unvisited.length > 0) {
            unvisited.sort((a, b) => distances.get(a) - distances.get(b));
            const current = unvisited.shift();

            if (current === endNode) {
                break;
            }

            visited.add(current);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;

                const edgeId = `${current}-${neighbor}`;
                const reverseEdgeId = `${neighbor}-${current}`;
                let weight = 1; 

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
    dijkstraAll(startNode) {
        if (!this.nodes.has(startNode)) {
            return null;
        }

        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const unvisited = [];

        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, nodeId === startNode ? 0 : Infinity);
            unvisited.push(nodeId);
        }

        while (unvisited.length > 0) {
            unvisited.sort((a, b) => distances.get(a) - distances.get(b));
            const current = unvisited.shift();
            if (distances.get(current) === Infinity) break;
            visited.add(current);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;

                const edgeId = `${current}-${neighbor}`;
                const reverseEdgeId = `${neighbor}-${current}`;
                let weight = 1;
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

        return { distances, previous };
    }

    hasHamiltonianCycle() {
        const cycle = this.findHamiltonianCycle();
        return Array.isArray(cycle) && cycle.length > 0;
    }

    findHamiltonianCycle() {
        if (this.nodes.size === 0) return null;
        if (this.nodes.size === 1) {
            const only = this.getNodeIds()[0];
            return null;
        }

        const nodeIds = this.getNodeIds();
        const start = nodeIds[0];
        const visited = new Set([start]);
        const path = [start];

        const dfs = (current) => {
            if (path.length === nodeIds.length) {
                const neighbors = this.getNeighbors(current);
                if (neighbors.includes(start)) {
                    return [...path, start];
                }
                return null;
            }

            const neighbors = this.getNeighbors(current);
            for (const next of neighbors) {
                if (!visited.has(next)) {
                    visited.add(next);
                    path.push(next);
                    const res = dfs(next);
                    if (res) return res;
                    path.pop();
                    visited.delete(next);
                }
            }
            return null;
        };

        return dfs(start);
    }

    hasHamiltonianPath() {
        const path = this.findHamiltonianPath();
        return Array.isArray(path) && path.length === this.nodes.size;
    }

    findHamiltonianPath() {
        const total = this.nodes.size;
        if (total === 0) return null;

        const nodeIds = this.getNodeIds();

        const tryFromStart = (start) => {
            const visited = new Set([start]);
            const path = [start];

            const dfs = (current) => {
                if (path.length === total) return [...path];
                const neighbors = this.getNeighbors(current);
                for (const next of neighbors) {
                    if (!visited.has(next)) {
                        visited.add(next);
                        path.push(next);
                        const res = dfs(next);
                        if (res) return res;
                        path.pop();
                        visited.delete(next);
                    }
                }
                return null;
            };

            return dfs(start);
        };
    
        for (const s of nodeIds) {
            const result = tryFromStart(s);
            if (result) return result;
        }
        return null;
    }

    eccentricity(nodeId) {
        if (!this.nodes.has(nodeId)) return -1;

        let maxDistance = 0;
        const distances = new Map();

        for (const id of this.nodes.keys()) {
            distances.set(id, id === nodeId ? 0 : Infinity);
        }

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

    getComponentCount() {
        return this.getConnectedComponents().length;
    }

    isTree() {
        return this.isConnected() && this.edges.size === this.nodes.size - 1;
    }

    getNodeIds() {
        return Array.from(this.nodes.keys());
    }

    getEdgeIds() {
        return Array.from(this.edges.keys());
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    getEdge(id) {
        return this.edges.get(id);
    }

    updateNode(id, label) {
        if (this.nodes.has(id)) {
            this.nodes.get(id).label = label;
            return true;
        }
        return false;
    }

    updateEdge(sourceId, targetId, weight, directed) {
        const edgeId = `${sourceId}-${targetId}`;
        if (this.edges.has(edgeId)) {
            this.edges.get(edgeId).weight = weight;
            this.edges.get(edgeId).directed = directed;
            return true;
        }
        return false;
    }

    colorGraph() {
        if (this.nodes.size === 0) {
            return new Map();
        }

        const coloring = new Map();
        const nodeIds = this.getNodeIds();

        const nodesByDegree = [...nodeIds].sort((a, b) => {
            return this.getDegree(b) - this.getDegree(a);
        });

        for (const nodeId of nodesByDegree) {
            const neighbors = this.getNeighbors(nodeId);
            const usedColors = new Set();

            for (const neighbor of neighbors) {
                if (coloring.has(neighbor)) {
                    usedColors.add(coloring.get(neighbor));
                }
            }

            let color = 0;
            while (usedColors.has(color)) {
                color++;
            }

            coloring.set(nodeId, color);
        }

        return coloring;
    }

    getChromaticNumber() {
        const coloring = this.colorGraph();
        if (coloring.size === 0) return 0;
        
        let maxColor = -1;
        for (const color of coloring.values()) {
            if (color > maxColor) {
                maxColor = color;
            }
        }
        return maxColor + 1; 
    }
}
