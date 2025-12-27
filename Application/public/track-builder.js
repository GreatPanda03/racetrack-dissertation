// manages the track builder on the client


// [[ Imports ]] //
import Node from "./classes/node.js";
import Vector2 from "./classes/vector2.js";
import Track from "./classes/track.js";
import TrackRenderer from "./classes/track-renderer.js";



// [[ Variables ]] //
var canvas = document.getElementById("build-canvas");
var ctx = canvas.getContext("2d");

var toolType = null;
var moving = false;
var offset = new Vector2(0, 0);
var last = null
var selection = null;

var track;
var renderer;



// [[ Canvas Options & Tools ]] //

// prepares the functionality for each option button
function initialiseOptions() {
    let share = document.getElementById("options-export");

    share.addEventListener("click", (e) => {
        console.log(track);
        console.log(track.toJson(true));
    })
}

// selects the corresponding track element
function initialiseCanvasTools() {
    let path = document.getElementById("tools-path");
    let material = document.getElementById("tools-material"); 
    let obstacle = document.getElementById("tools-obstacle");
    let decoration = document.getElementById("tools-decoration");
    
    path.addEventListener("click", (e) => {
        toolType = "path";
    });

    material.addEventListener("click", (e) => {
        toolType = "material";
    });

    obstacle.addEventListener("click", (e) => {
        toolType = "obstacle";
    });

    decoration.addEventListener("click", (e) => {
        toolType = "decoration";
    });
}


// toggle the visibility of different track components
function initialiseVisualToggles() {
    let nodes = document.getElementById("visuals-nodes");
    let edges = document.getElementById("visuals-edges");
    let path = document.getElementById("visuals-track");
    let nodes_acw = document.getElementById("nodes-anticlockwise");
    let nodes_cw = document.getElementById("nodes-clockwise");

    function toggleButton(button, state) {
        button.querySelector(".button-on")
            .classList.toggle("hidden", !state);

        button.querySelector(".button-off")
            .classList.toggle("hidden", state);
    }

    nodes.addEventListener("click", (e) => {
        let state = !renderer.getNodesVisible();
        renderer.setNodesVisible(state);
        toggleButton(nodes, state);
        renderer.redrawTrack();
    });

    edges.addEventListener("click", (e) => {
        let state = !renderer.getEdgesVisible();
        renderer.setEdgesVisible(state);
        toggleButton(edges, state);
        renderer.redrawTrack();
    });

    path.addEventListener("click", (e) => {
        let state = !renderer.getTrackVisible();
        renderer.setTrackVisible(state);
        toggleButton(path, state);
        renderer.redrawTrack();
    });

    nodes_acw.addEventListener("click", (e) => {
        let path = track.getPath();
        let size = track.getSize();
        if (size < 1) return;

        let lastPos = path[size - 1].getPosition();

        for (let n = size - 1; n > 0; n--) {
            path[n].setPosition(path[n - 1].getPosition());
        }

        path[0].setPosition(lastPos);
        renderer.redrawTrack();
    });

    nodes_cw.addEventListener("click", (e) => {
        let path = track.getPath();
        let size = track.getSize();
        if (size < 1) return;

        let firstPos = path[0].getPosition();

        for (let n = 0; n < size - 1; n++) {
            path[n].setPosition(path[n + 1].getPosition());
        }

        path[size - 1].setPosition(firstPos);
        renderer.redrawTrack();
    })
}



// [[ "On Draw" Functions ]] //

// returns the position of the mouse relative to the canvas
function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x(), 
        y - rect.top  - offset.y()
    );
}

// when drawing starts on the canvas
function onDrawStart(x, y) {
    moving = true;
    last = getRelativePositionOnCanvas(canvas, x, y);

    // first, check for a (new) element selection
    selection = null;

    for (let node of track.getPath()) {
        let pos = node.getPosition();

        if (last.sub(pos).mag() <= 15) {
            selection = node;
            showSelectionDetails();
            break;
        }
    }

    // if no selection, assume canvas placement
    if (!selection) {
        if (toolType == "path") {
            let node = new Node(last, 100, false);
            track.addNode(node);
            renderer.addSegment(node);
            
            renderer.redrawTrack();
        }
    }
}

// when the mouse is being moved over the canvas
function onDrawMove(x, y) {
    if (!moving) return;

    let pos = getRelativePositionOnCanvas(canvas, x, y);

    // pans the canvas
    if (toolType == "pan") {
        offset = offset.add(pos.sub(last));
        last = pos;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(offset.x(), offset.y());
    
    } else if (selection) {
        selection.setPosition(
            new Vector2(pos.x(), pos.y()));
    }

    renderer.redrawTrack();
}

// when drawing ends on the canvas
function onDrawEnd(x, y) {
    if (!moving) return;
    moving = false;

    let pos = getRelativePositionOnCanvas(canvas, x, y);
    
    if (selection) {
        selection.setPosition(
            new Vector2(pos.x(), pos.y()));
    }

    renderer.redrawTrack();
}



// [[ Canvas Events ]]//

// prepares all canvas drawing events
function initialiseCanvas() {
    let canvas = document.getElementById("build-canvas");

    canvas.addEventListener("pointerdown",  (e) => onDrawStart(e.clientX, e.clientY) );
    canvas.addEventListener("pointermove",  (e) => onDrawMove(e.clientX, e.clientY));
    canvas.addEventListener("pointerup",    (e) => onDrawEnd(e.clientX, e.clientY) );
    canvas.addEventListener("pointerleave", (e) => onDrawEnd(e.clientX, e.clientY) );
}



// [[ Selection Details ]] //

// displays details according to the current selection
function showSelectionDetails() {
    let nodeDetails = document.getElementById("details-node");

    if (selection instanceof Node) {
        nodeDetails.classList.remove("hidden");
        updateNodeDetails(selection);
        
    } else {
        nodeDetails.classList.add("hidden");
    }
}


// updates the node details area with the given node
function updateNodeDetails(node) {
    let nodeTitle = document.getElementById("details-node-title");
    let widthInput = document.getElementById("node-width-input");
    let checkpointInput = document.getElementById("node-checkpoint-input");

    let index = track.getNodeIndex(node) + 1;

    nodeTitle.innerHTML = `<b>Node ${index}</b>`;
    widthInput.value = node.getWidth();

    // Node 1 is always the starting line
    checkpointInput.checked = node.isCheckpoint() || (index == 1);
    checkpointInput.disabled = (index == 1);
}   


// applies node details to the current selected node (if any)
function initialiseNodeDetails() {
    let widthInput = document.getElementById("node-width-input");
    let checkpointInput = document.getElementById("node-checkpoint-input");

    widthInput.addEventListener("change", (e) => {
        if (selection instanceof Node) {
            selection.setWidth(Number(widthInput.value));
            renderer.redrawTrack();
        }
    });

    checkpointInput.addEventListener("change", (e) => {
        if (selection instanceof Node) {
            selection.setCheckpoint(checkpointInput.checked);
            renderer.redrawTrack();
        }
    });
}



// [[ Set Up ]] //

track = new Track();
renderer = new TrackRenderer(track, canvas);

initialiseOptions();
initialiseCanvasTools();
initialiseVisualToggles();

initialiseCanvas();

initialiseNodeDetails();

lucide.createIcons();
renderer.redrawTrack();