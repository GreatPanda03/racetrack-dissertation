// manages the track builder on the client


// [[ Variables ]] //
var canvas = document.getElementById("build-canvas");
var ctx = canvas.getContext("2d");

var toolType = null;
var moving = false;
var offset = new Vector2(0, 0);
var last = null
var selection = null;

var track = new Track();
var leftSide = [];
var rightSide = [];



// [[ Tool Selection ]] //

// selects the corresponding track element
function initialiseTools() {
    let path = document.getElementById("tools-path");
    let material = document.getElementById("tools-material"); 
    let obstacle = document.getElementById("tools-obstacle");
    let decoration = document.getElementById("tools-decoration");
    
    path.addEventListener("click", (e) => {
        toolType = "path";
        console.log(toolType);
    });

    material.addEventListener("click", (e) => {
        toolType = "material";
        console.log(toolType);
    });

    obstacle.addEventListener("click", (e) => {
        toolType = "obstacle";
        console.log(toolType);
    });

    decoration.addEventListener("click", (e) => {
        toolType = "decoration";
        console.log(toolType);
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

        if (last.subtract(pos).magnitude() <= 10) {
            selection = node;
            break;
        }
    }

    // if no selection, assume canvas placement
    if (!selection) {
        if (toolType == "path") {
            let node = new Node(last, 25, false);
            track.addNode(node);
        }
    }
}

// when the mouse is being moved over the canvas
function onDrawMove(x, y) {
    if (!moving) return;

    let pos = getRelativePositionOnCanvas(x, y);

    // pans the canvas
    if (toolType == "pan") {
        offset = offset.add(pos.subtract(last));
        last = pos;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(offset.x(), offset.y());
    
    } else if (selection) {
        selection.setPosition(
            new Vector2(pos.x(), pos.y()));
    }

    redrawTrack();
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

    redrawTrack();
}



// [[ Drawing Functions ]] //

// redraws the track onto the canvas
function redrawTrack() {
    clearCanvas();
    
    let path = track.getPath();
    let size = track.getSize();

    // edges
    for (let n = 0; n < track.getSize(); n++) {
        let pos1 = path[n].getPosition();
        let pos2 = path[(n + 1) % size].getPosition();

        ctx.strokeStyle = "#AAA";
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(pos1.x(), pos1.y());
        ctx.lineTo(pos2.x(), pos2.y());
        ctx.stroke();

    }

    // nodes
    for (let n = 0; n < track.getSize(); n++) {
        let node = path[n];
        let pos = node.getPosition();
        let text = (n + 1).toString();

        ctx.fillStyle = "#5AF";
        ctx.beginPath();
        ctx.ellipse(pos.x(), pos.y(), 15, 15, 0, 2 * Math.PI, 0);
        ctx.fill();

        ctx.font = "16px Segoe UI";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFF";
        ctx.strokeText(text, pos.x() - 4, pos.y() + 5);
    }
}

// clears the entire canvas
function clearCanvas() {
    ctx.clearRect(-offset.x(), -offset.y(), canvas.width, canvas.height);
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

lucide.createIcons();

initialiseTools();
initialiseCanvas();