// manages the track builder on the client


// [[ Imports ]] //
import {
    Vector2, Polygon, PathNode,
    TrackNode, Material, Obstacle, Decoration,
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
    function initialiseCompact() {
        let compactBtn = document.getElementById("options-compact");
        let compact = true;

        function applyCompact() {
            let labels = document.querySelectorAll("button span");

            for (let label of labels) {
                label.hidden = compact;
            }

            compactBtn.getElementsByTagName("label")[0].innerHTML
                = `<b>Compact:</b> ${compact ? "on" : "off"}`;
        }

        compactBtn.addEventListener("click", (e) => {
            compact = !compact;
            applyCompact();
        });

        applyCompact();
    }

    function initialiseDetails() {
        let detailsPrompt = document.getElementById("options-details");
        let detailsApply = document.getElementById("details-apply");

        detailsPrompt.addEventListener("click", (e) => {
            let nameInput = document.getElementById("details-name");
            let descriptionInput = document.getElementById("details-description");

            nameInput.value = track.getName();
            descriptionInput.value = track.getDescription();

            let popup = document.getElementById("modal-track-details");
            let modal = new bootstrap.Modal(popup);
            modal.show();
        });

        detailsApply.addEventListener("click", () => {
            let nameInput = document.getElementById("details-name");
            let descriptionInput = document.getElementById("details-description");

            track.setName(nameInput.value);
            track.setDescription(descriptionInput.value);
        });
    }

    function initialiseSave() {
        let saveBtn = document.getElementById("options-save");

        saveBtn.addEventListener("click", async () => {
            try {
                await fetch("/tracks/save", {
                   method: "POST",
                   headers: new Headers({ "Content-Type": "application/json"}),
                   body: track.toJson() 
                });

                saveBtn.classList.remove("btn-primary");
                saveBtn.classList.add("btn-success");

                setTimeout(() => {
                    saveBtn.classList.add("btn-primary");
                    saveBtn.classList.remove("btn-success");
                }, 500);

            } catch (error) {
                console.log(error);
            }
        });
    }
    
    function initialiseImport() {
        let importPrompt = document.getElementById("options-import");
        let importSubmit = document.getElementById("import-submit");
        let importInput = document.getElementById("import-input");
        let importError = document.getElementById("import-error");

        importPrompt.addEventListener("click", (e) => {
            let popup = document.getElementById("modal-track-import");
            let modal = new bootstrap.Modal(popup);
            modal.show();
        });

        importSubmit.addEventListener("click", (e) => {
            let json = importInput.value.trim();

            try {
                track = Track.toInstance(JSON.parse(json));
                renderer.setTrack(track);
                importError.classList.add("hidden");

                let popup = document.getElementById("modal-track-import");
                let modal = new bootstrap.Modal(popup);
                modal.hide();

            } catch(error) {
                importError.innerHTML = "Invalid JSON provided!";
                importError.classList.remove("hidden");
            }
        });
    }

    function initialiseExport() {
        let exportPrompt = document.getElementById("options-export");
        let exportCopy = document.getElementById("export-copy");
        let exportOutput = document.getElementById("export-output");
        let exportError = document.getElementById("export-error");

        exportPrompt.addEventListener("click", (e) => {
            let popup = document.getElementById("modal-track-export");
            let modal = new bootstrap.Modal(popup);
            modal.show();

            exportOutput.value = track.toJson(4);
            exportError.hidden = true;
        });

        exportCopy.addEventListener("click", (e) => {
            exportOutput.select();
            document.execCommand('copy'); // TODO: DEPRECATED - find an alternative!!

            exportError.hidden = false;
            exportError.innerHTML = "Copied Track JSON to Clipboard!";
        });
    }

    initialiseCompact();
    initialiseDetails();
    initialiseSave();
    initialiseImport();
    initialiseExport();
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
    let toggles = ["nodes", "wires", "path", "materials", "obstacles", "decorations"];

    function toggleVisibilityOnClick(target) {
        let button = document.getElementById(`visuals-${target}`);

        button.addEventListener("click", (e) => {
            let state = !renderer.getVisibility(target);
            toggleButton(button, state);
            renderer.setVisibility(target, state);
            renderer.redrawTrack();
        })
    }

    for (let target of toggles) {
        toggleVisibilityOnClick(target);
    }
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

    let createPolygon = {
        [TOOL_TYPE.Material]: () => {
            let material = new Material(null, tool.Secondary);
            track.addMaterial(material);
            return material;
        },
        [TOOL_TYPE.Obstacle]: () => {
            let obstacle = new Obstacle();
            track.addObstacle(obstacle);
            return obstacle;
        },
        [TOOL_TYPE.Decoration]: () => {
            let decoration = new Decoration();
            track.addDecoration(decoration);
            return decoration;
        }
    }

    // select the element clicked over
    if (tool.Primary == TOOL_TYPE.Select) {
        let selected = false;
        selection = {};

        if (!selected) selected = checkNodesClicked(track.getPath(), mousePos, 15);
        if (!selected) selected = checkPolygonsClicked(track.getMaterials(), mousePos, 10);
        if (!selected) selected = checkPolygonsClicked(track.getObstacles(), mousePos, 10);
        if (!selected) selected = checkPolygonsClicked(track.getDecorations(), mousePos, 10);

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
    
    // place a point in a new / existing polygon-based element
    } else if (
           tool.Primary == TOOL_TYPE.Material
        || tool.Primary == TOOL_TYPE.Obstacle
        || tool.Primary == TOOL_TYPE.Decoration
    ) {
        let point = new PathNode(mousePos);
        selection.Primary = point;

        if ( !(selection.Secondary instanceof Polygon) ) {
            let polygon = createPolygon[tool.Primary]();
            polygon.addPoint(point);
            selection.Secondary = polygon;

        } else {
            selection.Secondary.addPoint(point);
        }

        renderer.redrawTrack();
    }

    if (selection.Primary) showSelectionDetails();

    last = mousePos;
}

function checkNodesClicked(nodes, mousePos, radius) {
    for (let node of nodes) {
        let pos = node.getPosition();

        if (mousePos.sub(pos).mag() <= radius) {
            selection.Primary = node;
            return true;
        }
    }

    return false;
}

function checkPolygonsClicked(polygons, mousePos, radius) {
    for (let polygon of polygons) {
        for (let point of polygon.getPoints()) {
            let pos = point.getPosition();

            if (mousePos.sub(pos).mag() <= radius) {
                selection.Primary = point;
                selection.Secondary = polygon;
                return true;
            }
        }
    }

    return false;
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
    
    // ... or just drags the selection
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
    let obstacleDetails = document.getElementById("details-obstacle");
    let decorationDetails = document.getElementById("details-decoration");
    let pointDetails = document.getElementById("details-point");

    let sections = [
        nodeDetails, 
        materialDetails, 
        obstacleDetails, 
        decorationDetails,
        pointDetails
    ];

    for (let section of sections) {
        section.classList.add("hidden");
    }

    if (selection.Primary instanceof TrackNode) {
        updateNodeDetails(selection.Primary);
        nodeDetails.classList.remove("hidden");
        
    } else if (selection.Secondary instanceof Material) {
        updateMaterialDetails(selection.Secondary);
        materialDetails.classList.remove("hidden");

        if (selection.Primary instanceof PathNode) {
            updatePointDetails(track.getMaterials(), selection.Primary);
            pointDetails.classList.remove("hidden");
        }
    
    } else if (selection.Secondary instanceof Obstacle) {
        updateObstacleDetails(selection.Secondary);
        obstacleDetails.classList.remove("hidden");

        if (selection.Primary instanceof PathNode) {
            updatePointDetails(track.getObstacles(), selection.Primary);
            pointDetails.classList.remove("hidden");
        }
    
    } else if (selection.Secondary instanceof Decoration) {
        updateDecorationDetails(selection.Secondary);
        decorationDetails.classList.remove("hidden");

        if (selection.Primary instanceof PathNode) {
            updatePointDetails(track.getDecorations(), selection.Primary);
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
    let index = track.getMaterials().findIndex((m) => m == material);

    materialTitle.innerHTML = `<b>Material ${index + 1}</b>`;
    typeInput.value = material.getType();
}


// updates the obstacle details area with the given obstacle
function updateObstacleDetails(obstacle) {
    if ( !(obstacle instanceof Obstacle) ) return;

    let obstacleTitle = document.getElementById("details-obstacle-title");
    let index = track.getObstacles().findIndex((o) => o == obstacle);

    obstacleTitle.innerHTML = `<b>Obstacle ${index + 1}</b>`;
}


// updates the decoration details area with the given decoration
function updateDecorationDetails(decoration) {
    if ( !(decoration instanceof Decoration) ) return;

    let decorationTitle = document.getElementById("details-decoration-title");
    let colourInput = document.getElementById("decoration-colour-input");
    let index = track.getDecorations().findIndex((d) => d == decoration);

    decorationTitle.innerHTML = `<b>Decoration ${index + 1}</b>`;
    colourInput.value = decoration.getColour();
}


// updates the point details area with the given point
function updatePointDetails(polygons, point) {
    if ( !(point instanceof PathNode) ) return;

    let pointTitle = document.getElementById("details-point-title");
    let index;

    for (let polygon of polygons) {
        let points = polygon.getPoints();
        let i = points.findIndex((p) => p == point);
        
        if (i > -1) {
            index = i;
            break;
        }
    }

    pointTitle.innerHTML = `<b>Point ${index + 1}</b>`;
}


// inputs to apply operations / details to the current selected node (if any)
function initialiseNodeDetails() {
    let widthInput = document.getElementById("node-width-input");
    let checkpointInput = document.getElementById("node-checkpoint-input");
    let addBefore = document.getElementById("details-node-addBefore");
    let addAfter = document.getElementById("details-node-addAfter");
    let deleteBtn = document.getElementById("details-node-delete");

    widthInput.addEventListener("change", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;

        node.setWidth(Number(widthInput.value));
        renderer.redrawTrack();
    });

    checkpointInput.addEventListener("change", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;
        
        node.setCheckpoint(checkpointInput.checked);
        renderer.redrawTrack();
    });

    addBefore.addEventListener("click", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;

        let index = track.getNodeIndex(node);
        index = (index == 0 ? track.getSize() : index);

        let t = index - 0.5;
        let newPos = SplineUtil.getPointAtT(track.getPath(), t, true);
        let newNode = new TrackNode(newPos, 100, false);
        track.addNodeAtIndex(newNode, index);

        renderer.redrawTrack();
        updateNodeDetails(node);
    });

    addAfter.addEventListener("click", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;

        let index = track.getNodeIndex(node);
        index = index + 1;

        let t = index - 0.5
        let newPos = SplineUtil.getPointAtT(track.getPath(), t, true);
        let newNode = new TrackNode(newPos, 100, false);
        track.addNodeAtIndex(newNode, index);

        renderer.redrawTrack();
        updateNodeDetails(node);
    });

    deleteBtn.addEventListener("click", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;
        
        track.removeNode(node);
        selection.Primary = null;
        
        renderer.redrawTrack();
        showSelectionDetails();
    });
}


// inputs to apply operations / details to the current selected material (if any)
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
        if ( !(material instanceof Material) ) return;

        material.setType(typeInput.value);
        renderer.redrawTrack();
    });

    deleteBtn.addEventListener("click", (e) => {
        deletePolygonIfSecondary(track.removeMaterial);
    });
}


// inputs to apply operations to the selected obstacle (if any)
function initialiseObstacleDetails() {
    let deleteBtn = document.getElementById("details-obstacle-delete");

    deleteBtn.addEventListener("click", (e) => {
        deletePolygonIfSecondary(track.removeObstacle);
    });
}


// inputs to apply operations to the selected decoration (if any)
function initialiseDecorationDetails() {
    let colourInput = document.getElementById("decoration-colour-input");
    let deleteBtn = document.getElementById("details-decoration-delete");

    colourInput.addEventListener("change", (e) => {
        let decoration = selection.Secondary;
        if ( !(decoration instanceof Decoration) ) return;

        decoration.setColour(colourInput.value);
        renderer.redrawTrack();
    });

    deleteBtn.addEventListener("click", (e) => {
        deletePolygonIfSecondary(track.removeDecoration);
    });
}


function deletePolygonIfSecondary(removalMethod) {
    let polygon = selection.Secondary;
    if ( !(polygon instanceof Polygon) ) return;

    removalMethod.call(track, polygon);
    selection.Primary = null;
    selection.Secondary = null

    showSelectionDetails();
    renderer.redrawTrack();
}


// inputs to apply operations to the selected point (if any)
function initialisePointDetails() {
    let deleteBtn = document.getElementById("details-point-delete");

    deleteBtn.addEventListener("click", (e) => {
        let point = selection.Primary;
        let polygon = selection.Secondary;

        polygon.removePoint(point);
        selection.Primary = null;

        if (polygon.getPoints().length == 0) {
            selection.Secondary = null;
            
            if (polygon instanceof Material) {
                track.removeMaterial(polygon);
            } else if (polygon instanceof Obstacle) {
                track.removeObstacle(polygon);
            } else if (polygon instanceof Decoration) {
                track.removeDecoration(polygon);
            } else {
                throw new Error(`[Track Builder] "${polygon}" is not of a recognised component type`);
            }
        }

        showSelectionDetails();
        renderer.redrawTrack();
    });
}



// [[ Set Up ]] //

if (trackToLoad) {
    track = Track.toInstance(trackToLoad);
} else {
    track = new Track();
}

renderer = new TrackRenderer(track, canvas);

initialiseBuilderOptions();
initialiseCanvasTools();
initialiseVisualToggles();
initialiseManipulationOptions();

initialiseCanvas();

initialiseNodeDetails();
initialiseMaterialDetails();
initialiseObstacleDetails();
initialiseDecorationDetails();
initialisePointDetails();

lucide.createIcons();
renderer.redrawTrack();


// enables all tooltips on the page
// * source: https://getbootstrap.com/docs/5.3/components/tooltips/
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});