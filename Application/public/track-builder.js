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

    function toggleButton(button, state) {
        button.querySelector(".button-on")
            .classList.toggle("hidden", !state);

        button.querySelector(".button-off")
            .classList.toggle("hidden", state);
    }

    nodes.addEventListener("click", (e) => {
        let state = !renderer.getNodesVisible()
        renderer.setNodesVisible(state);
        toggleButton(nodes, state);
        renderer.redrawTrack();
    });

    edges.addEventListener("click", (e) => {
        let state = !renderer.getEdgesVisible()
        renderer.setEdgesVisible(state);
        toggleButton(edges, state);
        renderer.redrawTrack();
    });

    path.addEventListener("click", (e) => {
        let state = !renderer.getTrackVisible()
        renderer.setTrackVisible(state);
        toggleButton(path, state);
        renderer.redrawTrack();
    });
}



// [[ "On Draw" Functions ]] //

// returns the position of the mouse relative to the canvas
function getRelativePositionOnCanvas(x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x(), 
        y - rect.top  - offset.y()
    );
}

// when drawing starts on the canvas
function onDrawStart(x, y) {
    moving = true;
    last = getRelativePositionOnCanvas(x, y);

    // first, check for a (new) element selection
    selection = null;

    for (let node of track.getPath()) {
        let pos = node.getPosition();

        if (last.sub(pos).mag() <= 10) {
            selection = node;
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

    let pos = getRelativePositionOnCanvas(x, y);

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

    let pos = getRelativePositionOnCanvas(x, y);
    
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



// [[ Set Up ]] //

track = new Track();
renderer = new TrackRenderer(track, canvas);

lucide.createIcons();

initialiseOptions();
initialiseCanvasTools();
initialiseVisualToggles();
initialiseCanvas();

renderer.redrawTrack();