class GraphApp {
    constructor() {
        this.graph = new Graph();
        this.cy = null;
        this.selectedElement = null;
        this.nodeCounter = 1;
        this.edgeCounter = 1;
        this.layoutInitialized = false;
        this.isDrawingEdge = false;
        this.firstNodeForEdge = null;
        this.initializeCytoscape();
        this.setupEventListeners();
    }

    initializeCytoscape() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#3498db',
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': 'white',
                        'font-size': '14px',
                        'width': '40px',
                        'height': '40px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#34495e',
                        'target-arrow-color': '#34495e',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(weight)',
                        'font-size': '12px',
                        'text-background-color': 'white',
                        'text-background-opacity': 0.8,
                        'text-background-padding': '2px'
                    }
                },
                {
                    selector: 'edge[!directed]',
                    style: {
                        'target-arrow-shape': 'none'
                    }
                },
                {
                    selector: 'edge[directed = false]',
                    style: {
                        'target-arrow-shape': 'none'
                    }
                },
                {
                    selector: '.highlighted',
                    style: {
                        'background-color': '#e74c3c',
                        'line-color': '#e74c3c',
                        'target-arrow-color': '#e74c3c'
                    }
                },
                {
                    selector: '.selected',
                    style: {
                        'background-color': '#f39c12',
                        'line-color': '#f39c12',
                        'target-arrow-color': '#f39c12'
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
                selectionType: 'single'
        });

        // Handle element selection
        this.cy.on('tap', 'node', (event) => {
            const node = event.target;
            this.handleNodeClickForEdgeDrawing(node);
        });

        this.cy.on('tap', 'edge', (event) => {
            const edge = event.target;
            this.selectElement(edge);
        });

        // Handle background tap to deselect
        this.cy.on('tap', (event) => {
            if (event.target === this.cy) {
                this.deselectElement();
            }
        });
    }

    setupEventListeners() {
        // Node operations
        document.getElementById('addNodeBtn').addEventListener('click', () => {
            this.showNodeModal();
        });

        document.getElementById('editNodeBtn').addEventListener('click', () => {
            if (this.selectedElement && this.selectedElement.isNode()) {
                this.showNodeModal(this.selectedElement);
            } else {
                alert('Please select a node to edit.');
            }
        });

        // Edge operations
        document.getElementById('addEdgeBtn').addEventListener('click', () => {
            this.showEdgeModal();
        });

        document.getElementById('drawEdgeBtn').addEventListener('click', () => {
            this.toggleDrawEdgeMode();
        });

        document.getElementById('editEdgeBtn').addEventListener('click', () => {
            if (this.selectedElement && this.selectedElement.isEdge()) {
                this.showEdgeModal(this.selectedElement);
            } else {
                alert('Please select an edge to edit.');
            }
        });

        // Delete operations
        document.getElementById('deleteElementBtn').addEventListener('click', () => {
            this.deleteSelectedElement();
        });

        // Graph properties
        document.getElementById('calculatePropertiesBtn').addEventListener('click', () => {
            this.calculateAndDisplayProperties();
        });

        // Graph algorithms
        document.getElementById('findEulerianBtn').addEventListener('click', () => {
            this.animateEulerianPath();
        });

        document.getElementById('findShortestPathBtn').addEventListener('click', () => {
            this.animateShortestPath();
        });

        // Save/Load functionality
        document.getElementById('saveGraphBtn').addEventListener('click', () => {
            this.saveGraph();
        });

        document.getElementById('loadGraphBtn').addEventListener('click', () => {
            this.loadGraph();
        });

        document.getElementById('clearGraphBtn').addEventListener('click', () => {
            this.clearGraph();
        });

        // Modal event listeners
        this.setupModalListeners();
    }

    setupModalListeners() {
        // Node modal
        const nodeModal = document.getElementById('nodeModal');
        const nodeForm = document.getElementById('nodeForm');

        nodeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNode();
        });

        // Edge modal
        const edgeModal = document.getElementById('edgeModal');
        const edgeForm = document.getElementById('edgeForm');

        edgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdge();
        });

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                nodeModal.style.display = 'none';
                edgeModal.style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === nodeModal) {
                nodeModal.style.display = 'none';
            }
            if (event.target === edgeModal) {
                edgeModal.style.display = 'none';
            }
        });
    }

    showNodeModal(node = null) {
        const modal = document.getElementById('nodeModal');
        const title = document.getElementById('nodeModalTitle');
        const form = document.getElementById('nodeForm');
        const idInput = document.getElementById('nodeId');
        const labelInput = document.getElementById('nodeLabel');

        if (node) {
            title.textContent = 'Edit Node';
            idInput.value = node.id();
            labelInput.value = node.data('label') || '';
            idInput.disabled = true;
        } else {
            title.textContent = 'Add Node';
            idInput.value = `node${this.nodeCounter}`;
            labelInput.value = '';
            idInput.disabled = false;
        }

        modal.style.display = 'block';
    }

    showEdgeModal(edge = null) {
        const modal = document.getElementById('edgeModal');
        const title = document.getElementById('edgeModalTitle');
        const form = document.getElementById('edgeForm');
        const sourceSelect = document.getElementById('sourceNode');
        const targetSelect = document.getElementById('targetNode');
        const weightInput = document.getElementById('edgeWeight');
        const directedCheckbox = document.getElementById('edgeDirected');

        // Populate node selects
        const nodeIds = this.graph.getNodeIds();
        sourceSelect.innerHTML = '';
        targetSelect.innerHTML = '';

        nodeIds.forEach(nodeId => {
            const option1 = document.createElement('option');
            option1.value = nodeId;
            option1.textContent = nodeId;
            sourceSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = nodeId;
            option2.textContent = nodeId;
            targetSelect.appendChild(option2);
        });

        if (edge) {
            title.textContent = 'Edit Edge';
            const source = edge.source().id();
            const target = edge.target().id();
            sourceSelect.value = source;
            targetSelect.value = target;
            weightInput.value = edge.data('weight') || '';
            directedCheckbox.checked = edge.data('directed') || false;
        } else {
            title.textContent = 'Add Edge';
            weightInput.value = '';
            directedCheckbox.checked = false;
        }

        modal.style.display = 'block';
    }

    saveNode() {
        const idInput = document.getElementById('nodeId');
        const labelInput = document.getElementById('nodeLabel');
        const modal = document.getElementById('nodeModal');

        const id = idInput.value.trim();
        const label = labelInput.value.trim();

        if (!id) {
            alert('Node ID is required.');
            return;
        }

        // Check if editing existing node
        const existingNode = this.cy.getElementById(id);
        if (existingNode.length > 0 && !idInput.disabled) {
            alert('A node with this ID already exists.');
            return;
        }

        if (existingNode.length > 0) {
            // Update existing node
            this.graph.updateNode(id, label);
            existingNode.data('label', label);
        } else {
            // Add new node
            this.graph.addNode(id, label);
            this.cy.add({
                group: 'nodes',
                data: { id: id, label: label }
            });
            this.nodeCounter++;
        }

        this.updateCytoscapeLayout();
        modal.style.display = 'none';
    }

    saveEdge() {
        const sourceSelect = document.getElementById('sourceNode');
        const targetSelect = document.getElementById('targetNode');
        const weightInput = document.getElementById('edgeWeight');
        const directedCheckbox = document.getElementById('edgeDirected');
        const modal = document.getElementById('edgeModal');

        const sourceId = sourceSelect.value;
        const targetId = targetSelect.value;
        const weight = weightInput.value ? parseFloat(weightInput.value) : null;
        const directed = directedCheckbox.checked;

        if (!sourceId || !targetId) {
            alert('Both source and target nodes are required.');
            return;
        }

        if (sourceId === targetId) {
            alert('Source and target nodes cannot be the same.');
            return;
        }

        // Check if edge already exists
        const existingEdge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
        if (existingEdge.length > 0) {
            alert('An edge between these nodes already exists.');
            return;
        }

        // Add edge to graph
        this.graph.addEdge(sourceId, targetId, weight, directed);

        // Add edge to Cytoscape
        const edgeId = `${sourceId}-${targetId}`;
        this.cy.add({
            group: 'edges',
            data: {
                id: edgeId,
                source: sourceId,
                target: targetId,
                weight: weight,
                directed: directed
            }
        });

        this.updateCytoscapeLayout();
        modal.style.display = 'none';
    }

    deleteSelectedElement() {
        if (!this.selectedElement) {
            alert('Please select an element to delete.');
            return;
        }

        if (this.selectedElement.isNode()) {
            const nodeId = this.selectedElement.id();
            this.graph.removeNode(nodeId);
            this.selectedElement.remove();
        } else if (this.selectedElement.isEdge()) {
            const sourceId = this.selectedElement.source().id();
            const targetId = this.selectedElement.target().id();
            this.graph.removeEdge(sourceId, targetId);
            this.selectedElement.remove();
        }

        this.deselectElement();
        this.updateCytoscapeLayout();
    }

    selectElement(element) {
        this.deselectElement();
        this.selectedElement = element;
        element.addClass('selected');
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.removeClass('selected');
            this.selectedElement = null;
        }
    }

    updateCytoscapeLayout() {
        // Only run layout if we have elements and it's the first time or significant change
        if (this.cy.elements().length > 0 && !this.layoutInitialized) {
            const layout = this.cy.layout({
                name: 'cose',
                animate: true,
                animationDuration: 500,
                fit: true,
                padding: 50
            });
            layout.run();
            this.layoutInitialized = true;
        }
    }

    calculateAndDisplayProperties() {
        const output = document.getElementById('propertiesOutput');
        const properties = [];

        properties.push(`<strong>Basic Properties:</strong>`);
        properties.push(`Number of nodes: ${this.graph.nodes.size}`);
        properties.push(`Number of edges: ${this.graph.edges.size}`);
        properties.push(`Connected: ${this.graph.isConnected() ? 'Yes' : 'No'}`);
        properties.push(`Number of components: ${this.graph.getComponentCount()}`);
        properties.push(`Is tree: ${this.graph.isTree() ? 'Yes' : 'No'}`);

        properties.push(`<br><strong>Graph Metrics:</strong>`);
        const radius = this.graph.radius();
        const diameter = this.graph.diameter();
        properties.push(`Radius: ${radius === -1 ? 'N/A' : radius}`);
        properties.push(`Diameter: ${diameter === -1 ? 'N/A' : diameter}`);

        properties.push(`<br><strong>Eulerian Properties:</strong>`);
        properties.push(`Has Eulerian cycle: ${this.graph.hasEulerianCycle() ? 'Yes' : 'No'}`);
        properties.push(`Has Eulerian path: ${this.graph.hasEulerianPath() ? 'Yes' : 'No'}`);

        properties.push(`<br><strong>Node Degrees:</strong>`);
        for (const nodeId of this.graph.getNodeIds()) {
            properties.push(`Degree of ${nodeId}: ${this.graph.getDegree(nodeId)}`);
        }

        output.innerHTML = properties.join('<br>');
    }

    findEulerianPath() {
        const path = this.graph.findEulerianPath();
        if (!path) {
            alert('No Eulerian path exists in this graph.');
            return;
        }

        // Highlight the path
        this.cy.elements().removeClass('highlighted');
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];
            const edge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (edge.length === 0) {
                // Try reverse direction
                const reverseEdge = this.cy.edges(`[source = "${targetId}"][target = "${sourceId}"]`);
                if (reverseEdge.length > 0) {
                    reverseEdge.addClass('highlighted');
                }
            } else {
                edge.addClass('highlighted');
            }
        }

        alert(`Eulerian path found: ${path.join(' → ')}`);
    }

    findShortestPath() {
        const nodeIds = this.graph.getNodeIds();
        if (nodeIds.length < 2) {
            alert('Need at least 2 nodes to find shortest path.');
            return;
        }

        // For simplicity, use first and last nodes
        const startNode = nodeIds[0];
        const endNode = nodeIds[nodeIds.length - 1];

        const result = this.graph.dijkstra(startNode, endNode);
        if (!result || result.distance === Infinity) {
            alert(`No path exists between ${startNode} and ${endNode}.`);
            return;
        }

        // Highlight the path
        this.cy.elements().removeClass('highlighted');
        for (let i = 0; i < result.path.length - 1; i++) {
            const sourceId = result.path[i];
            const targetId = result.path[i + 1];
            const edge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (edge.length === 0) {
                // Try reverse direction
                const reverseEdge = this.cy.edges(`[source = "${targetId}"][target = "${sourceId}"]`);
                if (reverseEdge.length > 0) {
                    reverseEdge.addClass('highlighted');
                }
            } else {
                edge.addClass('highlighted');
            }
        }

        alert(`Shortest path from ${startNode} to ${endNode}: ${result.path.join(' → ')} (distance: ${result.distance})`);
    }

    // Save/Load functionality
    saveGraph() {
        try {
            const graphData = {
                nodes: Array.from(this.graph.nodes.entries()).map(([id, node]) => ({
                    id: node.id,
                    label: node.label
                })),
                edges: Array.from(this.graph.edges.entries()).map(([id, edge]) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    weight: edge.weight,
                    directed: edge.directed
                })),
                nodeCounter: this.nodeCounter,
                edgeCounter: this.edgeCounter
            };

            localStorage.setItem('graphData', JSON.stringify(graphData));
            alert('Graph saved successfully!');
        } catch (error) {
            alert('Error saving graph: ' + error.message);
        }
    }

    loadGraph() {
        try {
            const savedData = localStorage.getItem('graphData');
            if (!savedData) {
                alert('No saved graph found.');
                return;
            }

            const graphData = JSON.parse(savedData);

            // Clear current graph
            this.clearGraph();

            // Load nodes
            graphData.nodes.forEach(nodeData => {
                this.graph.addNode(nodeData.id, nodeData.label);
                this.cy.add({
                    group: 'nodes',
                    data: { id: nodeData.id, label: nodeData.label }
                });
            });

            // Load edges
            graphData.edges.forEach(edgeData => {
                this.graph.addEdge(edgeData.source, edgeData.target, edgeData.weight, edgeData.directed);
                this.cy.add({
                    group: 'edges',
                    data: {
                        id: edgeData.id,
                        source: edgeData.source,
                        target: edgeData.target,
                        weight: edgeData.weight,
                        directed: edgeData.directed
                    }
                });
            });

            // Update counters
            this.nodeCounter = graphData.nodeCounter || this.nodeCounter;
            this.edgeCounter = graphData.edgeCounter || this.edgeCounter;

            // Reset layout
            this.layoutInitialized = false;
            this.updateCytoscapeLayout();

            alert('Graph loaded successfully!');
        } catch (error) {
            alert('Error loading graph: ' + error.message);
        }
    }

    clearGraph() {
        // Clear graph data
        this.graph = new Graph();

        // Clear Cytoscape elements
        this.cy.elements().remove();

        // Reset counters and state
        this.nodeCounter = 1;
        this.edgeCounter = 1;
        this.layoutInitialized = false;
        this.selectedElement = null;

        // Clear properties output
        document.getElementById('propertiesOutput').innerHTML = '';
    }

    // Animated path finding
    async animateEulerianPath() {
        const path = this.graph.findEulerianPath();
        if (!path) {
            alert('No Eulerian path exists in this graph.');
            return;
        }

        // Clear previous highlights
        this.cy.elements().removeClass('highlighted');

        // Animate the path step by step
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];

            // Find the edge
            let edge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (edge.length === 0) {
                edge = this.cy.edges(`[source = "${targetId}"][target = "${sourceId}"]`);
            }

            if (edge.length > 0) {
                // Highlight current edge
                edge.addClass('highlighted');

                // Highlight current nodes
                const sourceNode = this.cy.getElementById(sourceId);
                const targetNode = this.cy.getElementById(targetId);
                sourceNode.addClass('highlighted');
                targetNode.addClass('highlighted');

                // Wait for animation
                await this.sleep(800);

                // Keep edge highlighted but remove node highlights for next step
                if (i < path.length - 2) {
                    sourceNode.removeClass('highlighted');
                }
            }
        }

        alert(`Eulerian path found: ${path.join(' → ')}`);
    }

    async animateShortestPath() {
        const nodeIds = this.graph.getNodeIds();
        if (nodeIds.length < 2) {
            alert('Need at least 2 nodes to find shortest path.');
            return;
        }

        // For simplicity, use first and last nodes
        const startNode = nodeIds[0];
        const endNode = nodeIds[nodeIds.length - 1];

        const result = this.graph.dijkstra(startNode, endNode);
        if (!result || result.distance === Infinity) {
            alert(`No path exists between ${startNode} and ${endNode}.`);
            return;
        }

        // Clear previous highlights
        this.cy.elements().removeClass('highlighted');

        // Animate the path step by step
        for (let i = 0; i < result.path.length - 1; i++) {
            const sourceId = result.path[i];
            const targetId = result.path[i + 1];

            // Find the edge
            let edge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (edge.length === 0) {
                edge = this.cy.edges(`[source = "${targetId}"][target = "${sourceId}"]`);
            }

            if (edge.length > 0) {
                // Highlight current edge
                edge.addClass('highlighted');

                // Highlight current nodes
                const sourceNode = this.cy.getElementById(sourceId);
                const targetNode = this.cy.getElementById(targetId);
                sourceNode.addClass('highlighted');
                targetNode.addClass('highlighted');

                // Wait for animation
                await this.sleep(1000);

                // Keep edge highlighted but remove node highlights for next step
                if (i < result.path.length - 2) {
                    sourceNode.removeClass('highlighted');
                }
            }
        }

        alert(`Shortest path from ${startNode} to ${endNode}: ${result.path.join(' → ')} (distance: ${result.distance})`);
    }

    // Mouse-based edge drawing functionality
    toggleDrawEdgeMode() {
        const drawBtn = document.getElementById('drawEdgeBtn');

        if (this.isDrawingEdge) {
            // Exit draw mode
            this.isDrawingEdge = false;
            this.firstNodeForEdge = null;
            drawBtn.classList.remove('active');
            drawBtn.textContent = 'Draw Edge';
            this.cy.container().style.cursor = 'default';

            // Remove visual feedback from any selected node
            this.cy.nodes().removeClass('first-node-selected');
        } else {
            // Enter draw mode
            this.isDrawingEdge = true;
            this.firstNodeForEdge = null;
            drawBtn.classList.add('active');
            drawBtn.textContent = 'Cancel Draw';
            this.cy.container().style.cursor = 'crosshair';

            // Clear any existing selections
            this.deselectElement();
        }
    }

    handleNodeClickForEdgeDrawing(node) {
        if (!this.isDrawingEdge) {
            // Normal node selection
            this.selectElement(node);
            return;
        }

        if (!this.firstNodeForEdge) {
            // First node selected
            this.firstNodeForEdge = node;
            node.addClass('first-node-selected');
            alert(`First node selected: ${node.id()}. Click on another node to create an edge.`);
        } else if (this.firstNodeForEdge.id() === node.id()) {
            // Same node clicked - deselect
            this.firstNodeForEdge.removeClass('first-node-selected');
            this.firstNodeForEdge = null;
            alert('Node deselected. Click on a different node to create an edge.');
        } else {
            // Second node selected - create edge
            const sourceId = this.firstNodeForEdge.id();
            const targetId = node.id();

            // Check if edge already exists
            const existingEdge = this.cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (existingEdge.length > 0) {
                alert('An edge between these nodes already exists.');
                this.firstNodeForEdge.removeClass('first-node-selected');
                this.firstNodeForEdge = null;
                return;
            }

            // Create edge with default settings (non-directed, non-weighted)
            this.graph.addEdge(sourceId, targetId, null, false);

            // Add edge to Cytoscape
            const edgeId = `${sourceId}-${targetId}`;
            this.cy.add({
                group: 'edges',
                data: {
                    id: edgeId,
                    source: sourceId,
                    target: targetId,
                    weight: null,
                    directed: false
                }
            });

            // Clear selection and exit draw mode
            this.firstNodeForEdge.removeClass('first-node-selected');
            this.firstNodeForEdge = null;
            this.toggleDrawEdgeMode();

            this.updateCytoscapeLayout();
            alert(`Edge created between ${sourceId} and ${targetId}`);
        }
    }

    // Utility function for animation delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GraphApp();
});
