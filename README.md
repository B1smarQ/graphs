# Graph Visualization and Analysis Tool

A comprehensive web application for creating, editing, analyzing, and persisting complex graphs with advanced visualization and algorithmic capabilities.

## Features

### Graph Creation & Editing
- Create and edit nodes with custom IDs and labels
- Add weighted and non-weighted edges
- **NEW**: Mouse-based edge drawing - click two nodes to create edges instantly
- Support for both directed and undirected graphs
- Interactive node and edge selection
- Delete elements with confirmation

### Advanced Visualization
- Interactive graph visualization using Cytoscape.js
- Stable layout that doesn't rearrange on every change
- Visual feedback for selected and highlighted elements
- Proper arrow display for directed/undirected edges

### Graph Analysis & Properties
- **Basic Properties**: Node/edge counts, connectivity, component analysis
- **Graph Metrics**: Radius and Diameter calculations
- **Eulerian Analysis**: Cycle and path detection
- **Node Analysis**: Individual node degrees
- **Tree Detection**: Check if graph is a tree structure

### Algorithmic Capabilities
- **Eulerian Path/Cycle Finding**: Uses Hierholzer's algorithm with step-by-step animation
- **Shortest Path**: Dijkstra's algorithm for weighted graphs with animated visualization
- **Animated Path Finding**: Watch algorithms execute step-by-step with visual feedback

### Persistence
- **Save Graphs**: Store graphs locally in browser storage
- **Load Graphs**: Restore previously saved graphs
- **Clear Graphs**: Reset workspace completely
- **Session Persistence**: Graphs persist between browser sessions

## Usage
1. Open `index.html` in any modern web browser
2. Use the control panel to:
   - Add nodes and edges to build your graph
   - Select elements to edit or delete them
   - Calculate and view comprehensive graph properties
   - Run animated algorithms (Eulerian path, shortest path)
   - Save/load graphs for later use

## Technical Details
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Cytoscape.js library
- **Storage**: Browser localStorage for graph persistence
- **Algorithms**: Custom implementations of graph algorithms
- **Architecture**: Object-oriented design with separation of concerns

## Browser Compatibility
Works in all modern browsers that support:
- ES6+ JavaScript features
- localStorage API
- Modern CSS features
