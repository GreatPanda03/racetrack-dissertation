// manages the track builder on the client


// [[ Imports ]] //
import {
    Vector2, PathNode,
    TrackNode, Material,
    Track, TrackRenderer,
    TOOL_TYPE, MATERIAL_INFO,
    SplineUtil
} from "/core/index.js";



// [[ Variables ]] //
var canvas = document.getElementById("build-canvas");
var ctx = canvas.getContext("2d");

var tool = {Primary: null, Secondary: null};
var selection = {Primary: null, Secondary: null};

var moving = false;
var selectionDiff = new Vector2();
var last = new Vector2();

var track;          // Track
var renderer;       // TrackRenderer



// [[ Canvas Options & Tools ]] //

// auxiliary: toggles the buttons icon between enabled / disabled
// * MUST have an "on" and "off" icon!
function toggleButton(button, state) {
    button.querySelector(".button-on")
        .classList.toggle("hidden", !state);

    button.querySelector(".button-off")
        .classList.toggle("hidden", state);
}


// builder options
function initialiseBuilderOptions() {
    let share = document.getElementById("options-export");

    share.addEventListener("click", (e) => {
        console.log(track);
        console.log(track.toJson(true));
    })
}

// selects the corresponding track element
function initialiseCanvasTools() {
    let selectBtn = document.getElementById("tools-select-btn");
    let pathBtn = document.getElementById("tools-path-btn");
    let materialBtn = document.getElementById("tools-materials-btn");
    let obstacleBtn = document.getElementById("tools-obstacles-btn");
    let decorationBtn = document.getElementById("tools-decoration-btn");
    
    let options = [
        selectBtn, pathBtn, materialBtn, obstacleBtn, decorationBtn];

    // auxiliary: mark / unmark buttons as selected
    function deselectAllTools() {
        tool = {};

        showSelectionDetails();

        for (let option of options) {
            option.classList.remove("active");
        }
    }

    function selectTool(type, button) {
        deselectAllTools();
        tool.Primary = type;
        button.classList.add("active");
    }

    selectBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Select, selectBtn);
    });

    pathBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Path, pathBtn);
    });

    obstacleBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Obstacle, obstacleBtn);
    });

    decorationBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Decoration, decorationBtn);
    });

    // material options
    let materialsDropdown = document.getElementById("tools-material-div")
        .getElementsByClassName("dropdown-menu")[0];

    for (let [material, values] of Object.entries(MATERIAL_INFO)) {
        let description = values.Description;

        let item = document.createElement("li");
        item.innerHTML = `
            <li class="dropdown-item">
                <div class="d-flex justify-content-between">
                    <span>
                        <i data-lucide="droplet"></i> ${material}
                    </span>
                    <i data-lucide="info" data-bs-toggle="tooltip" data-bs-placement="bottom" 
                        title="${description}">
                    </i>
                </div>
            </li>
        `;

        materialsDropdown.appendChild(item);

        item.addEventListener("click", (e) => {
            selectTool(TOOL_TYPE.Material, materialBtn);
            tool.Secondary = material;
        });
    }
}


// toggle the visibility of different track components
function initialiseVisualToggles() {
    let nodes = document.getElementById("visuals-nodes");
    let edges = document.getElementById("visuals-edges");
    let path = document.getElementById("visuals-track");
    let materials = document.getElementById("visuals-materials");

    nodes.addEventListener("click", (e) => {
        let state = !renderer.getNodesVisible();
        toggleButton(nodes, state);
        renderer.setNodesVisible(state);
        renderer.redrawTrack();
    });

    edges.addEventListener("click", (e) => {
        let state = !renderer.getEdgesVisible();
        toggleButton(edges, state);
        renderer.setEdgesVisible(state);
        renderer.redrawTrack();
    });

    path.addEventListener("click", (e) => {
        let state = !renderer.getTrackVisible();
        toggleButton(path, state);
        renderer.setTrackVisible(state);
        renderer.redrawTrack();
    });    

    materials.addEventListener("click", (e) => {
        let state = !renderer.getMaterialsVisible();
        toggleButton(materials, state);
        renderer.setMaterialsVisible(state);
        renderer.redrawTrack();
    });   
}


// manipulate the track's underlying structure
function initialiseManipulationOptions() {
    let nodes_acw = document.getElementById("nodes-anticlockwise");
    let nodes_cw = document.getElementById("nodes-clockwise");
    let reverse = document.getElementById("track-reverse");
    let looped = document.getElementById("track-looped");
    let centre = document.getElementById("track-centre");

    // for both "reverse" and "nodes_acw"
    function shiftNodesAnticlockwise() {
        let path = track.getPath();
        let size = track.getSize();
        if (size < 1) return;

        let lastPos = path[size - 1].getPosition();

        for (let n = size - 1; n > 0; n--) {
            path[n].setPosition(path[n - 1].getPosition());
        }

        path[0].setPosition(lastPos);
        renderer.redrawTrack();
    }

    nodes_acw.addEventListener("click", shiftNodesAnticlockwise);

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
    });

    reverse.addEventListener("click", (e) => {
        let path = track.getPath();
        track.setPath( path.reverse() );
        let newPath = track.getPath();

        let checkpoints = path.map(node => node.isCheckpoint());
        let widths = path.map(node => node.getWidth());
        checkpoints.unshift( checkpoints.pop() ); // shift all forward by 1
        widths.unshift( widths.pop() );

        for (let n = 0; n < track.getSize(); n++) {
            newPath[n].setCheckpoint(checkpoints[n]);
            newPath[n].setWidth(widths[n]);
        }

        shiftNodesAnticlockwise(); // moves "first" node back to being first
        renderer.redrawTrack();
    });

    looped.addEventListener("click", (e) => {
        let state = !track.isLooped();
        toggleButton(looped, state);
        track.setLooped(state);
        renderer.redrawTrack();

        if (selection == track.getPath()[track.getSize() - 1]) {
            updateNodeDetails(selection);
        }
    });

    centre.addEventListener("click", (e) => {
        let path = track.getPath();

        let minX = canvas.width, maxX = 0;
        let minY = canvas.height, maxY = 0;

        for (let node of path) { // calculating the track's centre
            let pos = node.getPosition();

            minX = pos.x() < minX ? pos.x() : minX;
            maxX = maxX < pos.x() ? pos.x() : maxX;

            minY = pos.y() < minY ? pos.y() : minY;
            maxY = maxY < pos.y() ? pos.y() : maxY;
        }

        let oldCentre = new Vector2(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2);
        let newCentre = new Vector2(canvas.width / 2, canvas.height / 2);

        for (let node of path) { // repositioning relative to canvas centre
            let oldPos = node.getPosition();
            let newPos = newCentre.add( oldPos.sub(oldCentre) );
            node.setPosition(newPos);
        }

        renderer.redrawTrack();
    })
}



// [[ "On Draw" Functions ]] //

// returns the position of the mouse relative to the canvas
function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    let relPos = new Vector2(x - rect.left, y - rect.top);
    let offset = renderer.getOffset();

    return relPos.sub(offset);
}


// when drawing starts on the canvas
function onDrawStart(x, y) {
    let mousePos = getRelativePositionOnCanvas(canvas, x, y);

    // select the element clicked over
    if (tool.Primary == TOOL_TYPE.Select) {
        selection = {};

        for (let node of track.getPath()) {
            let pos = node.getPosition();

            if (mousePos.sub(pos).mag() <= 15) {
                selection.Primary = node;
                break;
            }
        }

        for (let material of track.getMaterials()) {
            for (let point of material.getPoints()) {
                let pos = point.getPosition();

                if (mousePos.sub(pos).mag() <= 10) {
                    selection.Primary = point;
                    selection.Secondary = material;
                    break;
                }
            }
        }

        if (selection.Primary) {
            let pos = selection.Primary.getPosition();
            selectionDiff = pos.sub(mousePos);
            moving = true;
        }

        showSelectionDetails();
    
    // place a node to add to the track
    } else if (tool.Primary == TOOL_TYPE.Path) {
        let node = new TrackNode(mousePos, 100, false);
        
        selection.Primary = node;
        track.addNode(node);
        renderer.redrawTrack();
    
    // place a new material / node in a selected material
    } else if (tool.Primary == TOOL_TYPE.Material) {
        
        // * TODO: make this more reliable
        if ( !(selection.Secondary instanceof Material) ) {
            let material = new Material(null, tool.Secondary);
            let point = new PathNode(mousePos);
            material.addPoint(point);

            selection.Primary = point;
            selection.Secondary = material;
            track.addMaterial(material);
            renderer.redrawTrack();

        } else {
            let point = new PathNode(mousePos);

            selection.Primary = point;
            selection.Secondary.addPoint(point);
            renderer.redrawTrack();
        }
    }
        
    if (selection.Primary) showSelectionDetails();

    last = mousePos;
}


// when the mouse is being moved over the canvas
function onDrawMove(x, y) {
    if (!moving) return;

    let pos = getRelativePositionOnCanvas(canvas, x, y);

    // pans across the canvas
    if (tool.Primary == TOOL_TYPE.Pan) {
        renderer.shiftOffset(pos.sub(last));
        last = pos;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(offset.x(), offset.y());
    
    } else if (selection.Primary) {
        selection.Primary.setPosition(
            pos.add(selectionDiff));
    }

    renderer.redrawTrack();
}

// when drawing ends on the canvas
function onDrawEnd(x, y) {
    if (!moving) return;
    moving = false;
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
    let materialDetails = document.getElementById("details-material");
    let pointDetails = document.getElementById("details-point");

    let sections = [nodeDetails, materialDetails, pointDetails];

    for (let section of sections) {
        section.classList.add("hidden");
    }

    if (selection.Primary instanceof TrackNode) {
        updateNodeDetails(selection.Primary);
        nodeDetails.classList.remove("hidden");
        
    } else if (selection.Secondary instanceof Material) {
        updateMaterialDetails(selection.Secondary, selection.Primary);
        materialDetails.classList.remove("hidden");

        if (selection.Primary instanceof PathNode) {
            updatePointDetails(selection.Primary);
            pointDetails.classList.remove("hidden");
        }
    }
}


// updates the node details area with the given node
function updateNodeDetails(node) {
    if ( !(node instanceof TrackNode) ) return;

    let nodeTitle = document.getElementById("details-node-title");
    let widthInput = document.getElementById("node-width-input");
    let checkpointInput = document.getElementById("node-checkpoint-input");

    let order = track.getNodeIndex(node) + 1;
    let isFirst = order == 1;
    let isLast = !track.isLooped() && order == track.getSize();
    
    nodeTitle.innerHTML = `<b>Node ${order}</b>`;
    widthInput.value = node.getWidth();

    checkpointInput.checked = node.isCheckpoint() || isFirst || isLast
    checkpointInput.disabled = isFirst || isLast;
}


// updates the material details area with the given material
function updateMaterialDetails(material) {
    if ( !(material instanceof Material) ) return;

    let materialTitle = document.getElementById("details-material-title");
    let typeInput = document.getElementById("material-type-input");

    let index = track.getMaterials().findIndex((e) => e == material);

    materialTitle.innerHTML = `<b>Material ${index + 1}</b>`;
    typeInput.value = material.getType();
}


// updates the point details area with the given point
function updatePointDetails(point) {
    if ( !(point instanceof PathNode) ) return;

    let pointTitle = document.getElementById("details-point-title");
    let index;

    for (let material of track.getMaterials()) {
        let points = material.getPoints();
        let i = points.findIndex((p) => p == point);
        
        if (i > -1) {
            index = i;
            break;
        }
    }

    pointTitle.innerHTML = `<b>Point ${index + 1}</b>`;
}


// inputs to apply operations / details to the current
//   selected node (if any)
function initialiseNodeDetails() {
    let widthInput = document.getElementById("node-width-input");
    let checkpointInput = document.getElementById("node-checkpoint-input");
    let addBefore = document.getElementById("details-node-addBefore");
    let addAfter = document.getElementById("details-node-addAfter");
    let deleteBtn = document.getElementById("details-node-delete");

    widthInput.addEventListener("change", (e) => {
        let node = selection.Primary;

        if (node instanceof TrackNode) {
            node.setWidth(Number(widthInput.value));
            renderer.redrawTrack();
        }
    });

    checkpointInput.addEventListener("change", (e) => {
        let node = selection.Primary;

        if (node instanceof TrackNode) {
            node.setCheckpoint(checkpointInput.checked);
            renderer.redrawTrack();
        }
    });

    addBefore.addEventListener("click", (e) => {
        let node = selection.Primary;

        if (node instanceof TrackNode) {
            let index = track.getNodeIndex(node);
            index = (index == 0 ? track.getSize() : index);

            let t = index - 0.5;
            let newPos = SplineUtil.getPointAtT(track.getPath(), t, true);

            let newNode = new TrackNode(newPos, 100, false);
            track.addNodeAtIndex(newNode, index);

            renderer.redrawTrack();
            updateNodeDetails(node);
        }
    });

    addAfter.addEventListener("click", (e) => {
        let node = selection.Primary;

        if (node instanceof TrackNode) {
            let index = track.getNodeIndex(node);
            index = index + 1;

            let t = index - 0.5
            let newPos = SplineUtil.getPointAtT(track.getPath(), t, true);

            let newNode = new TrackNode(newPos, 100, false);
            track.addNodeAtIndex(newNode, index);

            renderer.redrawTrack();
            updateNodeDetails(node);
        }
    });

    deleteBtn.addEventListener("click", (e) => {
        let node = selection.Primary;

        if (node instanceof TrackNode) {
            track.removeNode(node);
            node.Primary = null;
            showSelectionDetails();
            renderer.redrawTrack();
        }
    });
}


// inputs to apply operations / details to the current
//   selected material (if any)
function initialiseMaterialDetails() {
    let typeInput = document.getElementById("material-type-input");
    let deleteBtn = document.getElementById("details-material-delete");

    // material details
    for (let [material, _] of Object.entries(MATERIAL_INFO)) {
        let option = document.createElement("option");
        option.value = material;
        option.innerHTML = material;
        typeInput.appendChild(option);
    }

    typeInput.addEventListener("change", (e) => {
        let material = selection.Secondary;

        if (material instanceof Material) {
            material.setType(typeInput.value);
            renderer.redrawTrack();
        }
    });

    deleteBtn.addEventListener("click", (e) => {
        let material = selection.Secondary;

        if (material instanceof Material) {
            track.removeMaterial(material);
            selection.Primary = null;
            selection.Secondary = null;
        }

        showSelectionDetails();
        renderer.redrawTrack();
    });
}


// inputs to apply operations to the selected point (if any)
function initialisePointDetails() {
    let deleteBtn = document.getElementById("details-point-delete");

    deleteBtn.addEventListener("click", (e) => {
        let point = selection.Primary;
        let material = selection.Secondary;

        if (material instanceof Material) {
            track.removeMaterialPoint(material, point);
            selection.Primary = null;

            if (material.getPoints().length == 0) {
                track.removeMaterial(material);
                selection.Secondary = null;
            }

            showSelectionDetails();
            renderer.redrawTrack();
        }
    });
}



// [[ Set Up ]] //

track = new Track();
renderer = new TrackRenderer(track, canvas);

initialiseBuilderOptions();
initialiseCanvasTools();
initialiseVisualToggles();
initialiseManipulationOptions();

initialiseCanvas();

initialiseNodeDetails();
initialiseMaterialDetails();
initialisePointDetails();

lucide.createIcons();
renderer.redrawTrack();


// enables all tooltips on the page
// * source: https://getbootstrap.com/docs/5.3/components/tooltips/
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});