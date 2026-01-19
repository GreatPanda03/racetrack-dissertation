// manages racing gameplay


// [[ Imports ]] //
import {
    Vector2,
    Track,
    CanvasRenderer, TrackRenderer,
    RaceCar, RaceInstance,
    RACECAR_STATE
} from "/core/index.js";



// [[ Variables ]] //

// gameplay
var raceInstance;

// rendering
var trackRenderer = null;
var raceRenderer = null;

var trackCanvas = document.getElementById("track-canvas");
var playCanvas = document.getElementById("play-canvas");

var spacing = 25; // pixels between each grid cell
var spotRadius = 10;
var racecarRadius = 7;
var pointRadius = 3;
var offset = new Vector2();



// [[ Gameplay & Controls ]] //

// loads the given track 
function loadTrack(t) {
    let track = Track.toInstance(JSON.parse(t));

    trackRenderer = new TrackRenderer(track, trackCanvas);
    trackRenderer.setVisibility("nodes", false);
    trackRenderer.setVisibility("wires", false);
    trackRenderer.redrawTrack();

    raceRenderer = new CanvasRenderer(playCanvas);

    let racecar = new RaceCar();
    raceInstance = new RaceInstance(track, [racecar]);

    renderRacecars();

    displayMoves(racecar, raceInstance.getPossibleMoves(racecar));
}


// allows the canvas to be interacted with to detect move choices
function initialisePlayCanvas() {
    playCanvas.addEventListener("click", (e) => {
        let racecar = raceInstance.getRacecars()[0];

        let mousePos = getRelativePositionOnCanvas(playCanvas, e.clientX, e.clientY);
        let centre = racecar.getPosition().add(racecar.getVelocity());
        let target;

        // retrieves the selected point (if any)
        let moves = raceInstance.getPossibleMoves(racecar);

        for (let move of moves) {
            let gridPos = centre.add(move.Offset);
            let newPos = gridPos.scale(spacing);
            let direction = mousePos.sub(newPos);

            if (direction.mag() <= spotRadius && move.Active) {
                target = move.Offset;
            }
        }

        if (!target) return;

        // move car to location
        raceInstance.moveRacecar(racecar, target);
        renderRacecars();

        // determining next step
        let state = raceInstance.getRacecarStats(racecar).getState();

        if (state == RACECAR_STATE.Racing) {
            displayMoves(
                racecar, raceInstance.getPossibleMoves(racecar));
        
        } else {
            let stats = raceInstance.getRacecarStats(racecar);
            endRace(stats, state)
        }
    });
}


// officially ends the race
function endRace(stats, state) {
    let titleText;

    let popup = document.getElementById("modal-race-results");
    let results = popup.getElementsByClassName("results")[0];

    let moves = stats.getMoves();
    let distance = stats.getDistance().toFixed(3);
    let time = stats.getTime().toFixed(3);
    let topSpeed = stats.getTopSpeed().toFixed(3);
    let averageSpeed = (distance / time).toFixed(3);

    results.innerHTML = 
        `<p>
                <b>Total Moves:</b> ${moves}
            <br><b>Distance:</b> ${distance} m
            <br><b>Time:</b> ${time} s
            <br><b>Top Speed:</b> ${topSpeed} m/s
            <br><b>Average Speed:</b> ${averageSpeed} m/s
        </p>`;

    if (state == RACECAR_STATE.Crashed) {
        let modal = new bootstrap.Modal(popup);
        modal.show();
        titleText = "You Crashed!";

    } else if (state == RACECAR_STATE.Finished) {
        let modal = new bootstrap.Modal(popup);
        modal.show();
        titleText = "You Finished the Race!";
    }

    let title = popup.getElementsByClassName("modal-title")[0];

    title.innerHTML = titleText;
}



// [[ Canvas Visualisations ]] // 

// renders the race car to the track
function renderRacecars() {
    raceRenderer.clearCanvas();
    
    for (let racecar of raceInstance.getRacecars()) {
        let pos = racecar.getPosition().scale(spacing);
        let raceStats = raceInstance.getRacecarStats(racecar);

        raceRenderer.drawCircle(pos, racecarRadius, "#A00");  // racecar

        let racecarPath = raceStats.getPath();              // racecar path (first dot)
        let firstDot = racecarPath[0].scale(spacing); 
        raceRenderer.drawCircle(firstDot, pointRadius, "#A00");

        for (let p = 0; p < racecarPath.length - 1; p ++) {
            let start = racecarPath[p].scale(spacing);
            let end = racecarPath[p + 1].scale(spacing);

            raceRenderer.drawLine(start, end, 1, "#A00");
            raceRenderer.drawCircle(end, pointRadius, "#A00");
        }
    }
}


// displays the available subsequent velocities for the player
function displayMoves(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let move of moves) {
        console.log(move);

        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        raceRenderer.drawCircle(pos, spotRadius, move.Active ? "#A00" : "#999", false);
    }
}


// returns the position of the mouse relative to the canvas
// * TODO: make this a generic utility function?
function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x(), 
        y - rect.top  - offset.y()
    );
}



// [[ Set Up ]] //

initialisePlayCanvas();

loadTrack(window.track);