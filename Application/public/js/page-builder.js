// manages the track builder on the client


// [[ Imports ]] //
import {
    Vector2, Polygon, PathNode,
    UndoRedoStack,
    TrackNode, Material, Obstacle, Decoration,
    Track, TrackRenderer,
    TOOL_TYPE, MATERIAL_INFO, ACTION_TYPE,
    SplineUtil, Validator
} from "/core/index.js";

import { initAuth, signInWithGoogle } from "./firebase.js";

import GeneralUI from "./utilities/general-ui.js";



// [[ Variables ]] //
var user = await initAuth();
var playerId = user.uid;

var canvas = document.getElementById("build-canvas");
var ctx = canvas.getContext("2d");

var tool = {Primary: null, Secondary: null};
var selection = {Primary: null, Secondary: null};

var moving = false;
var selectionDiff = new Vector2();
var last = new Vector2();
var changesMade = false;

var track;          // Track
var renderer;       // TrackRenderer
var reverter;       // UndoRedoStack
var spacing = 25;   // float



// [[ Helper Methods ]] //

// * button MUST have an "on" and "off" icon!
function toggleButton(button, state) {
    button.querySelector(".button-on")
        .classList.toggle("hidden", !state);

    button.querySelector(".button-off")
        .classList.toggle("hidden", state);
}



// [[ Base Tool Operations ]] //

function recordAction(action) {
    reverter.recordAction(action);

    let undoBtn = document.getElementById("options-undo");
    let redoBtn = document.getElementById("options-redo");

    undoBtn.classList.toggle("disabled", reverter.getUndoSize() == 0);
    redoBtn.classList.toggle("disabled", reverter.getRedoSize() == 0);

    changesMade = true;
}

async function saveTrack(trackObj) {
    // "trackObj" for consistency between different save uses

    if (user.isAnonymous) {
        let newUser = await signInWithGoogle();
        if (!user) {
            console.log("Login failed");
            return false;
        }
        user = newUser;
        playerId = user.uid;
    }

    // final info
    trackObj.authorId = playerId;
    trackObj.author = user.displayName;

    try {
        let trackId = trackObj._id;
        let saveRes;

        if (!trackId) {
            saveRes = await fetch(`/api/tracks`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify(trackObj)
            });

            if (saveRes.ok) {
                let newId = (await saveRes.json()).id;

                if (!trackId) {
                    changesMade = false;
                    window.location.href = `/builder/${newId}`;
                }
            }
        
        } else {
            saveRes = await fetch(`/api/tracks/${trackId}`, {
                method: "PATCH",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify(trackObj)
            });
        }

        return saveRes.ok;

    } catch(error) {
        console.log(error);
        return false;
    }
}

// general operations
function moveElement(record, element, position) {
    if (record) {
        recordAction({
            Type: ACTION_TYPE.Move,
            Target: element,
            Details: {
                Tool: {...tool},
                Selection: {...selection},
                Before: { Position: last },
                After: { Position: position }
            }
        });
    }

    element.setPosition(position);
    renderer.redrawTrack();
}

// node operations
function placeNode(record, node) {
    track.addNode(node);
    renderer.redrawTrack();

    if (record) {
        recordAction({
            Type: ACTION_TYPE.Place,
            Target: node,
            Details: {
                Tool: {...tool},
                Selection: {...selection},
            }
        });
    }
}

function placeNodeAtIndex(record, node, index) {
    track.addNodeAtIndex(node, index);
    renderer.redrawTrack();

    if (record) {
        recordAction({
            Type: ACTION_TYPE.Place,
            Target: node,
            Details: {
                Tool: {...tool},
                Selection: {...selection},
                Index: index
            }
        });
    }
}

function deleteNode(record, node) {
    if (record) {
        let index = track.getNodeIndex(node);

        recordAction({
            Type: ACTION_TYPE.Delete,
            Target: node,
            Details: {
                Tool: {...tool},
                Selection: {...selection},
                Index: index
            }
        });
    }
   
    track.removeNode(node);
    renderer.redrawTrack();
}

// general polygon operations
function placePolygon(record, polygon) {
    track[`add${polygon.constructor.name}`](polygon);
    renderer.redrawTrack();

    if (record) {
        recordAction({
            Type: ACTION_TYPE.Place,
            Target: polygon,
            Details: {
                Tool: {...tool},
                Selection: {...selection}
            }
        });
    }
}

function deletePolygon(record, polygon) {
    track[`remove${polygon.constructor.name}`](polygon);
    renderer.redrawTrack();

    if (record) {
        recordAction({
            Type: ACTION_TYPE.Delete,
            Target: polygon,
            Details: {
                Tool: {...tool},
                Selection: {...selection},
            }
        });
    }
}

function placePolygonPoint(record, polygon, point) {
    if (record) {
        recordAction({
            Type: ACTION_TYPE.Place,
            Target: point,
            Details: {
                Tool: {...tool},
                Selection: {...selection}
            }
        });
    }

    polygon.addPoint(point);
    renderer.redrawTrack();
}

function deletePolygonPoint(record, polygon, point) {
    if (record) {
        recordAction({
            Type: ACTION_TYPE.Delete,
            Target: point,
            Details: {
                Tool: {...tool},
                Selection: {...selection}
            }
        });
    }

    polygon.removePoint(point);
    renderer.redrawTrack();
}

// material operations


// obstacle operations


// decoration operations


// track manipulation
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

function shiftNodesClockwise() {
    let path = track.getPath();
    let size = track.getSize();
    if (size < 1) return;

    let firstPos = path[0].getPosition();

    for (let n = 0; n < size - 1; n++) {
        path[n].setPosition(path[n + 1].getPosition());
    }

    path[size - 1].setPosition(firstPos);
    renderer.redrawTrack();
}

function reverseTrack() {
    let path = track.getPath();
    let looped = track.isLooped();

    track.setPath( path.reverse() );
    let newPath = track.getPath();

    let checkpoints = path.map(node => node.isCheckpoint());
    let widths = path.map(node => node.getWidth());

    if (looped) { // shift all forward by 1 (looped correction)
        checkpoints.unshift( checkpoints.pop() );
        widths.unshift( widths.pop() );
    }

    for (let n = 0; n < track.getSize(); n++) {
        newPath[n].setCheckpoint(checkpoints[n]);
        newPath[n].setWidth(widths[n]);
    }

    if (looped) { // moves "first" node back to being first (looped correction)
        shiftNodesAnticlockwise();
    }

    renderer.redrawTrack();
}



// [[ Builder Options ]] //

function initialiseOptions_Compact() {
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

function initialiseOptions_Details() {
    let detailsPrompt = document.getElementById("options-details");
    let detailsApply = document.getElementById("details-apply");

    let detailsPopup = document.getElementById("modal-track-details");
    let detailsModal = new bootstrap.Modal(detailsPopup);

    detailsPrompt.addEventListener("click", (e) => {
        let nameInput = document.getElementById("details-name");
        let descriptionInput = document.getElementById("details-description");

        nameInput.value = track.getName();
        descriptionInput.value = track.getDescription();

        detailsModal.show();
    });

    detailsApply.addEventListener("click", () => {
        let nameInput = document.getElementById("details-name");
        let descriptionInput = document.getElementById("details-description");

        track.setName(nameInput.value);
        track.setDescription(descriptionInput.value);

        displayToast("Track Details Updated", "Successfully updated the track's details.\nPlease save the track as well!", "#0A0");

        changesMade = true;
    });
}

function validateTrackRequirements() {
    let path = track.getPath();
    let pathCount = path.length;
    let checkpointCount = path.filter(p => p.isCheckpoint()).length;
    let looped = track.isLooped();

    if (looped) {
        if (pathCount < 3 || checkpointCount < 1) {
            displayToast("Track Not Saved", "Looped tracks must have at least 3 nodes and 1 checkpoint!", "#C00");
            return false;
        }
    } else {
        if (pathCount < 2) {
            displayToast("Track Not Saved", "Unlooped tracks must have at least 2!", "#C00");
            return false;
        }
    }

    return true;
}

function initialiseOptions_Save() {
    let saveBtn = document.getElementById("options-save");

    saveBtn.addEventListener("click", async () => {
        let validTrack = validateTrackRequirements()
        if (!validTrack) return;

        let trackObj = track.toObject();
        let success = await saveTrack(trackObj);

        if (success) {
            changesMade = false;
            displayToast("Track Saved", "Successfully saved track.", "#0A0");
            saveBtn.classList.remove("btn-primary");
            saveBtn.classList.add("btn-success");

        } else {
            displayToast("Track Not Saved", "Failed to save the track, please try again.", "#C00");
            saveBtn.classList.remove("btn-primary");
            saveBtn.classList.add("btn-danger");
        }

        setTimeout(() => {
            saveBtn.classList.add("btn-primary");
            saveBtn.classList.remove("btn-success");
            saveBtn.classList.remove("btn-danger");
        }, 500);
    });
}

function initialiseOptions_SaveAs() {
    let saveAsBtn = document.getElementById("options-save-as");
    
    saveAsBtn.addEventListener("click", async (e) => {
        let pathCount = track.getPath().length;
        let looped = track.isLooped();

        if ((looped && pathCount < 3) || (!looped && pathCount < 2)) {
            displayToast("Track Not Saved", "Your track must have at least 2 nodes if unlooped, or at least 3 if looped!", "#C00");
            return;
        }

        let trackObj = track.toObject();
        trackObj._id = null;
        trackObj.name = trackObj.name + " Copy";

        let success = saveTrack(trackObj);

        if (success) {
            displayToast("Track Copy Saved", "Successfully saved the track as a new copy.", "#0A0");
            saveAsBtn.classList.remove("btn-primary");
            saveAsBtn.classList.add("btn-success");
        } else {
            displayToast("Track Copy Not Saved", "Failed to save the track as a new copy, please try again.", "#C00");
            saveAsBtn.classList.remove("btn-primary");
            saveAsBtn.classList.add("btn-danger");
        }

        setTimeout(() => {
            saveAsBtn.classList.add("btn-primary");
            saveAsBtn.classList.remove("btn-success");
        }, 500);
    });
}

function initialiseOptions_Undo() {
    let undoBtn = document.getElementById("options-undo");
    let redoBtn = document.getElementById("options-redo");

    undoBtn.classList.add("disabled");

    undoBtn.addEventListener("click", (e) => {
        let action = reverter.undoAction();
        if (!action) return;

        let target = action.Target;
        let primary = action.Details.Selection.Primary;
        let secondary = action.Details.Selection.Secondary;

        if (action.Type == ACTION_TYPE.Place) {
            if (target instanceof TrackNode) {
                let node = target;
                deleteNode(false, node);

                if (selection.Primary == node) {
                    selection.Primary = null;
                }
            
            } else if (target instanceof Polygon) {
                let polygon = target;
                deletePolygon(false, polygon);

                if (selection.Secondary == polygon) {
                    selection.Primary = null;
                    selection.Secondary = null;
                }

            } else if (target instanceof PathNode) {
                let point = target;
                let polygon = secondary;

                if (polygon.getPoints().length > 1) {
                    deletePolygonPoint(false, polygon, point);

                    if (selection.Primary == point) {
                        selection.Primary = null;
                    }

                } else {
                    deletePolygon(false, polygon);

                    if (selection.Secondary == polygon) {
                        selection.Primary = null;
                        selection.Secondary = null;
                    }
                }
            }

            showSelectionDetails();

        } else if (action.Type == ACTION_TYPE.Move) {
            let element = target;
            let position = action.Details.Before.Position;
            moveElement(false, element, position);

        } else if (action.Type == ACTION_TYPE.Delete) {
            if (target instanceof TrackNode) {
                let node = target;
                let index = action.Details.Index;

                if (index) {
                    placeNodeAtIndex(false, node, index);
                } else {
                    placeNode(false, node);
                }

            } else if (target instanceof Polygon) {
                let polygon = target
                placePolygon(false, polygon);

            } else if (primary instanceof PathNode) {
                let point = target;
                let polygon = secondary;

                if (polygon.getPoints().length <= 1) {
                    placePolygon(false, polygon);
                } else {
                    placePolygonPoint(false, polygon, point);
                }
            }
        }
        
        undoBtn.classList.toggle("disabled", reverter.getUndoSize() == 0);
        redoBtn.classList.toggle("disabled", reverter.getRedoSize() == 0);
    });
}

function initialiseOptions_Redo() {
    let redoBtn = document.getElementById("options-redo");
    let undoBtn = document.getElementById("options-undo");

    redoBtn.classList.add("disabled");

    redoBtn.addEventListener("click", (e) => {
        let action = reverter.redoAction();
        if (!action) return;

        let target = action.Target;
        let primary = action.Details.Selection.Primary;
        let secondary = action.Details.Selection.Secondary;

        if (action.Type == ACTION_TYPE.Place) {
            if (target instanceof TrackNode) {
                let node = target;
                let index = action.Details.Index;

                if (index) {
                    placeNodeAtIndex(false, node, index);
                } else {
                    placeNode(false, node);
                }

            } else if (target instanceof Polygon) {
                let polygon = secondary
                placePolygon(false, polygon);

            } else if (primary instanceof PathNode) {
                let point = target;
                let polygon = secondary;

                // TODO: find a workaround to this...
                //   had to create a "getPolygons()" method just to make this work

                let absent = track.getPolygons().findIndex((p) => p == polygon) == -1;

                if (absent && polygon.getPoints().length <= 1) {
                    placePolygon(false, polygon);
                } else {
                    placePolygonPoint(false, polygon, point);
                }
            }

        } else if (action.Type == ACTION_TYPE.Move) {
            let element = target;
            let position = action.Details.After.Position;
            moveElement(false, element, position);

        } else if (action.Type == ACTION_TYPE.Delete) {
            if (target instanceof TrackNode) {
                let node = target;
                deleteNode(false, node);

                if (selection.Primary == node) {
                    selection.Primary = null;
                }
            
            } else if (target instanceof Polygon) {
                let polygon = target;
                deletePolygon(false, polygon);

                if (selection.Secondary == polygon) {
                    selection.Primary = null;
                    selection.Secondary = null;
                }

            } else if (target instanceof PathNode) {
                let point = target;
                let polygon = secondary;

                if (polygon.getPoints().length > 1) {
                    deletePolygonPoint(false, polygon, point);

                    if (selection.Primary == point) {
                        selection.Primary = null;
                    }

                } else {
                    deletePolygon(false, polygon);

                    if (selection.Secondary == polygon) {
                        selection.Primary = null;
                        selection.Secondary = null;
                    }
                }
            }

            showSelectionDetails();
        }
        
        redoBtn.classList.toggle("disabled", reverter.getRedoSize() == 0);
        undoBtn.classList.toggle("disabled", reverter.getUndoSize() == 0);
    });
}

function initialiseOptions_Test() {
    let testBtn = document.getElementById("options-test");

    // TODO: add option to choose a race car

    testBtn.addEventListener("click", async (e) => {
        let trackId = track.getId();

        if (!trackId) {
            displayToast("Cannot Test Unsaved Track", "Please save your track first to test it out.", "#C00");
            return;
        }

        let testRes = await fetch(`/api/builder/test/${trackId}`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            body: JSON.stringify({ user })
        }).then(r => r.json());

        if (testRes.success) {
            let raceId = testRes.raceId;
            window.location.href = `/races/${raceId}`;
        
        } else {
            displayToast("Failed to Start Test", `Something went wrong when trying to start the test race: ${testRes.error}`, "#C00");
            return;
        }
    });
}

function initialiseOptions_Import() {
    let importPrompt = document.getElementById("options-import");
    let importSubmit = document.getElementById("import-submit");
    let importInput = document.getElementById("import-input");

    let importPopup = document.getElementById("modal-track-import");
    let importModal = new bootstrap.Modal(importPopup);

    importPrompt.addEventListener("click", (e) => {
        importModal.show();
    });

    importSubmit.addEventListener("click", (e) => {
        let json = importInput.value.trim();

        try {
            track = Track.toInstance(JSON.parse(json));
            renderer.setTrack(track);

            importModal.hide();

            displayToast("Track Imported", "Successfully imported the track.", "#0A0");

        } catch(error) {
            displayToast("Track Not Imported", `Failed to import track: ${error}.`, "#C00");
        }
    });
}

function initialiseOptions_Export() {
    let exportPrompt = document.getElementById("options-export");
    let exportCopy = document.getElementById("export-copy");
    let exportOutput = document.getElementById("export-output");

    let exportPopup = document.getElementById("modal-track-export");
    let exportModal = new bootstrap.Modal(exportPopup);

    exportPrompt.addEventListener("click", (e) => {
        exportModal.show();
        exportOutput.value = JSON.stringify(track, null, 2);
    });

    exportCopy.addEventListener("click", (e) => {
        exportOutput.select();
        document.execCommand('copy'); // TODO: DEPRECATED - find an alternative!!

        displayToast("Track Copied to Clipboard", "Successfully copied the track to clipboard.", "#0A0");
    });
}

function initialiseBuilderOptions() {
    initialiseOptions_Compact();
    initialiseOptions_Details();
    initialiseOptions_Save();
    initialiseOptions_SaveAs();
    initialiseOptions_Undo();
    initialiseOptions_Redo();
    initialiseOptions_Test();
    initialiseOptions_Import();
    initialiseOptions_Export();
}



// [[ Track Visual Options ]] //

function initialiseVisualToggles() {
    let toggles = ["nodes", "wires", "path", 
        "materials", "obstacles", "decorations", "grid"];

    function applyToggleOnClick(target) {
        let button = document.getElementById(`visuals-${target}`);

        button.addEventListener("click", (e) => {
            let state = !renderer.getVisibility(target);
            toggleButton(button, state);
            renderer.setVisibility(target, state);
            renderer.redrawTrack();
        })
    }

    for (let target of toggles) {
        applyToggleOnClick(target);
    }
}



// [[ Track Canvas Tools ]] //

function deselectAllTools() {
    tool = {};

    let toolsDiv = document.getElementById("build-tools");
    let options = toolsDiv.querySelectorAll("button");

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

function initialiseTools_Select() {
    let selectBtn = document.getElementById("tools-select-btn");

    selectBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Select, selectBtn);
    });
}

function initialiseTools_Pan() {
    // TODO: complete
}

function initialiseTools_Path() {
    let pathBtn = document.getElementById("tools-path-btn");

    pathBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Path, pathBtn);
    });
}

function initialiseTools_Material() {
    let materialBtn = document.getElementById("tools-materials-btn");

    let materialsDropdown = document.getElementById("tools-material-div")
        .getElementsByClassName("dropdown-menu")[0];

    for (let [material, values] of Object.entries(MATERIAL_INFO)) {
        let description = values.Description;
        let colour = values.Colour;

        let item = document.createElement("li");
        item.innerHTML = `
            <li class="dropdown-item">
                <div class="d-flex justify-content-between">
                    <div class="d-flex align-items-center gap-1">
                        <i data-lucide="droplet" class="rounded-circle" stroke="${colour}"; fill="${colour}";></i>
                        <span>${material}</span>
                    </div>
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

function initialiseTools_Obstacle() {
    let obstacleBtn = document.getElementById("tools-obstacles-btn");

    obstacleBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Obstacle, obstacleBtn);
    });
}

function initialiseTools_Decoration() {
    let decorationBtn = document.getElementById("tools-decoration-btn");

    decorationBtn.addEventListener("click", (e) => {
        selectTool(TOOL_TYPE.Decoration, decorationBtn);
    });
}

function initialiseCanvasTools() {
    initialiseTools_Select();
    initialiseTools_Pan();
    initialiseTools_Path();
    initialiseTools_Material();
    initialiseTools_Obstacle();
    initialiseTools_Decoration();
}



// [[ Track Manipulation Tools ]] //

function initialiseTools_NodesACW() {
    let nodes_acw = document.getElementById("nodes-anticlockwise");
    nodes_acw.addEventListener("click", shiftNodesAnticlockwise);
}

function initialiseTools_NodesCW() {
    let nodes_cw = document.getElementById("nodes-clockwise");
    nodes_cw.addEventListener("click", shiftNodesClockwise);
}

function initialiseTools_Flip() {
    let reverse = document.getElementById("track-reverse");
    reverse.addEventListener("click", reverseTrack);
}

function initialiseTools_Looped() {
    let looped = document.getElementById("track-looped");

    looped.addEventListener("click", (e) => {
        let state = !track.isLooped();
        toggleButton(looped, state);
        track.setLooped(state);
        renderer.redrawTrack();

        if (selection.Primary == track.getPath()[track.getSize() - 1]) {
            updateDetails_Node(selection.Primary);
        }
    });
}

function initialiseTools_Recentre() {
    let recentre = document.getElementById("track-recentre");

    recentre.addEventListener("click", (e) => {
        let path = track.getPath();

        let minX = canvas.width, maxX = 0;
        let minY = canvas.height, maxY = 0;

        for (let node of path) { // calculating the track's centre
            let pos = node.getPosition();

            minX = pos.x < minX ? pos.x : minX;
            maxX = maxX < pos.x ? pos.x : maxX;

            minY = pos.y < minY ? pos.y : minY;
            maxY = maxY < pos.y ? pos.y : maxY;
        }

        let oldCentre = new Vector2(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2);
        let newCentre = new Vector2(canvas.width / 2, canvas.height / 2);

        for (let node of path) { // repositioning relative to canvas centre
            let oldPos = node.getPosition();
            let newPos = newCentre.add( oldPos.sub(oldCentre) );
            node.setPosition(newPos);
        }

        for (let polygon of track.getPolygons()) {
            for (let point of polygon.getPoints()) {
                let oldPos = point.getPosition();
                let newPos = newCentre.add( oldPos.sub(oldCentre) );
                point.setPosition(newPos);
            }
        }

        renderer.redrawTrack();
    });
}

function initialiseManipulationOptions() {
    initialiseTools_NodesACW();
    initialiseTools_NodesCW();
    initialiseTools_Flip();
    initialiseTools_Looped();
    initialiseTools_Recentre();
}



// [[ Canvas "On Draw" ]] //

// helpers
function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    let relPos = new Vector2(x - rect.left, y - rect.top);
    let offset = renderer.getOffset();

    return relPos.sub(offset);
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

// main drawing
function onDrawStart(x, y) {
    let mousePos = getRelativePositionOnCanvas(canvas, x, y);

    let createPolygon = {
        [TOOL_TYPE.Material]:   () => { return new Material(undefined, tool.Secondary); },
        [TOOL_TYPE.Obstacle]:   () => { return new Obstacle(); },
        [TOOL_TYPE.Decoration]: () => { return new Decoration(); }
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

        placeNode(true, node);
    
    // place a point in a new / existing polygon-based element
    } else if (
           tool.Primary == TOOL_TYPE.Material
        || tool.Primary == TOOL_TYPE.Obstacle
        || tool.Primary == TOOL_TYPE.Decoration
    ) {
        let point = new PathNode(mousePos);
        let polygon = selection.Secondary;

        console.log(polygon);

        if ( !(polygon instanceof Polygon) ) {
            polygon = createPolygon[tool.Primary]();
            track[`add${polygon.constructor.name}`](polygon);
        }

        selection.Primary = point;
        selection.Secondary = polygon;

        placePolygonPoint(true, polygon, point);
    }

    if (selection.Primary) showSelectionDetails();

    last = mousePos;
}

function onDrawMove(x, y) {
    if (!moving) return;

    let pos = getRelativePositionOnCanvas(canvas, x, y);

    // pans across the canvas
    if (tool.Primary == TOOL_TYPE.Pan) {
        renderer.shiftOffset(pos.sub(last));

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(offset.x, offset.y);
    
    // ... or just drags the selection
    } else if (selection.Primary) {
        let newPos = pos.add(selectionDiff);
        moveElement(false, selection.Primary, newPos);
    }
}

function onDrawEnd(x, y) {
    if (!moving) return;

    if (tool.Primary == TOOL_TYPE.Select && selection.Primary) {
        let position = selection.Primary.getPosition();
        moveElement(true, selection.Primary, position);
    }

    moving = false;
}

function initialiseCanvasDrawing() {
    let canvas = document.getElementById("build-canvas");

    canvas.addEventListener("pointerdown",  (e) => onDrawStart(e.clientX, e.clientY) );
    canvas.addEventListener("pointermove",  (e) => onDrawMove(e.clientX, e.clientY));
    canvas.addEventListener("pointerup",    (e) => onDrawEnd(e.clientX, e.clientY) );
    canvas.addEventListener("pointerleave", (e) => onDrawEnd(e.clientX, e.clientY) );
}



// [[ Selection Details Display ]] //

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

    function runPointDetails(polygon) {
        if (selection.Primary instanceof PathNode) {
            updateDetails_Point(polygon, selection.Primary);
            pointDetails.classList.remove("hidden");
        }
    }

    if (selection.Primary instanceof TrackNode) {
        updateDetails_Node(selection.Primary);
        nodeDetails.classList.remove("hidden");
        
    } else if (selection.Secondary instanceof Material) {
        updateDetails_Material(selection.Secondary);
        materialDetails.classList.remove("hidden");
        runPointDetails(selection.Secondary);
    
    } else if (selection.Secondary instanceof Obstacle) {
        updateDetails_Obstacle(selection.Secondary);
        obstacleDetails.classList.remove("hidden");
        runPointDetails(selection.Secondary);
    
    } else if (selection.Secondary instanceof Decoration) {
        updateDetails_Decoration(selection.Secondary);
        decorationDetails.classList.remove("hidden");
        runPointDetails(selection.Secondary);
    }
}

function updateDetails_Node(node) {
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

function updateDetails_Material(material) {
    if ( !(material instanceof Material) ) return;

    let materialTitle = document.getElementById("details-material-title");
    let typeInput = document.getElementById("material-type-input");
    let index = track.getMaterials().findIndex((m) => m == material);

    materialTitle.innerHTML = `<b>Material ${index + 1}</b>`;
    typeInput.value = material.getType();
}

function updateDetails_Obstacle(obstacle) {
    if ( !(obstacle instanceof Obstacle) ) return;

    let obstacleTitle = document.getElementById("details-obstacle-title");
    let index = track.getObstacles().findIndex((o) => o == obstacle);

    obstacleTitle.innerHTML = `<b>Obstacle ${index + 1}</b>`;
}

function updateDetails_Decoration(decoration) {
    if ( !(decoration instanceof Decoration) ) return;

    let decorationTitle = document.getElementById("details-decoration-title");
    let colourInput = document.getElementById("decoration-colour-input");
    let index = track.getDecorations().findIndex((d) => d == decoration);

    decorationTitle.innerHTML = `<b>Decoration ${index + 1}</b>`;
    colourInput.value = decoration.getColour();
}

function updateDetails_Point(polygon, point) {
    if ( !(point instanceof PathNode) ) return;

    let pointTitle = document.getElementById("details-point-title");

    let points = polygon.getPoints();
    let index = points.findIndex((p) => p == point);

    pointTitle.innerHTML = `<b>Point ${index > -1 ? index + 1 : "N/A"}</b>`;
}


// [[ Selection Details Manipulation ]] //

function initialiseDetails_Node() {
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
        
        // TODO: make it so that "placeNodeAtIndex"
        //   refers to the new node WITHOUT having to set
        //   the selection (undo / redo currently depend
        //   on the current selection!)

        selection.Primary = newNode;
        placeNodeAtIndex(true, newNode, index);

        updateDetails_Node(newNode);
    });

    addAfter.addEventListener("click", (e) => {
        let node = selection.Primary;
        if ( !(node instanceof TrackNode) ) return;

        let index = track.getNodeIndex(node);
        index = index + 1;

        let t = index - 0.5
        let newPos = SplineUtil.getPointAtT(track.getPath(), t, true);
        let newNode = new TrackNode(newPos, 100, false);
        
        selection.Primary = newNode;
        placeNodeAtIndex(true, newNode, index);

        updateDetails_Node(newNode);
    });

    deleteBtn.addEventListener("click", (e) => {
       let node = selection.Primary;
       selection.Primary = null;
       deleteNode(true, node);
       showSelectionDetails();
    });
}

function initialiseDetails_Material() {
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

    deleteBtn.addEventListener("click", () => {
        deletePolygon(true, selection.Secondary);
        selection.Primary = null;
        selection.Secondary = null;
        showSelectionDetails();
    });
}

function initialiseDetails_Obstacle() {
    let deleteBtn = document.getElementById("details-obstacle-delete");

    deleteBtn.addEventListener("click", () => {
        deletePolygon(true, selection.Secondary);
        selection.Primary = null;
        selection.Secondary = null;
        showSelectionDetails();
    });
}

function initialiseDetails_Decoration() {
    let colourInput = document.getElementById("decoration-colour-input");
    let deleteBtn = document.getElementById("details-decoration-delete");

    colourInput.addEventListener("change", (e) => {
        let decoration = selection.Secondary;
        if ( !(decoration instanceof Decoration) ) return;

        decoration.setColour(colourInput.value);
        renderer.redrawTrack();
    });

    deleteBtn.addEventListener("click", () => {
        deletePolygon(true, selection.Secondary);
        selection.Primary = null;
        selection.Secondary = null;
        showSelectionDetails();
    });
}

function initialiseDetails_Point() {
    let deleteBtn = document.getElementById("details-point-delete");

    deleteBtn.addEventListener("click", (e) => {
        let point = selection.Primary;
        let polygon = selection.Secondary;

        selection.Primary = null;

        if (polygon.getPoints().length > 1) {
            deletePolygonPoint(true, polygon, point);

        } else {
            selection.Secondary = null;
            deletePolygon(true, polygon);
            showSelectionDetails();
        }
        
        showSelectionDetails();
        renderer.redrawTrack();
    });
}

function initialiseElementDetails() {
    initialiseDetails_Node();
    initialiseDetails_Material();
    initialiseDetails_Obstacle();
    initialiseDetails_Decoration();
    initialiseDetails_Point();
}



// [[ Other UI ]] //

function displayToast(title = "Notification", message = "Default Message", colour = "#59D") {
    let toast = document.querySelector(".toast");

    let toastIcon = toast.querySelector(".toast-icon");
    let toastTitle = toast.querySelector(".toast-title");
    let toastBody = toast.querySelector(".toast-body");

    toastIcon.setAttribute("fill", colour);
    toastIcon.setAttribute("stroke", colour);
    toastTitle.innerHTML = title;
    toastBody.innerHTML = message;

    let bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}



// [[ Set Up ]] //

function loadAllUI() {
    initialiseBuilderOptions();

    initialiseCanvasTools();
    initialiseVisualToggles();
    initialiseManipulationOptions();

    initialiseCanvasDrawing();

    initialiseElementDetails();

    GeneralUI.prepareTooltips();

    // warns about unsaved changes (if any)
    window.addEventListener("beforeunload", (e) => {
        if (changesMade) e.preventDefault();
    });
}


if (trackToLoad_) {
    let authorId = trackToLoad_.authorId;
    let author = trackToLoad_.author;

    // forbidden access
    if (playerId != authorId || author == "Game") {
        window.location.href = "/builder";
    }

    track = Track.toInstance(trackToLoad_);
} else {
    track = new Track();
}

renderer = new TrackRenderer(track, canvas, spacing);
reverter = new UndoRedoStack();
renderer.redrawTrack();

loadAllUI();

lucide.createIcons();