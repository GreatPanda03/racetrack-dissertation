// manages racing gameplay


// [[ Imports ]] //
import {
    Vector2,
    Track, TrackRenderer,
    RaceCar, RaceInstance,
    RACECAR_STATE
} from "/core/index.js";



// [[ Variables ]] //

// gameplay
var raceInstance;

// rendering
var renderer = null;
var trackCanvas = document.getElementById("track-canvas");
var playCanvas = document.getElementById("play-canvas");

var spacing = 25; // pixels between each grid cell
var spotRadius = 10;
var racecarRadius = 7;
var offset = new Vector2();



// [[ Gameplay & Controls ]] //

// loads the given track 
function loadTrack(t) {
    let track = Track.toInstance(JSON.parse(t));

    renderer = new TrackRenderer(track, trackCanvas);
    renderer.setNodesVisible(false);
    renderer.setEdgesVisible(false);
    renderer.redrawTrack();

    // preparing the race instance
    raceInstance = new RaceInstance(track);
    raceInstance.addRacecar(new RaceCar());
    raceInstance.prepareRacecars();

    renderRacecars();
    
    let racecar = raceInstance.getRacecars()[0];

    displayMoves(
        racecar, raceInstance.getPossibleMoves(racecar));
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
            <br><b>Top Speed:</b> ${topSpeed} ms⁻²
            <br><b>Average Speed:</b> ${averageSpeed} ms⁻²
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
    let ctx = playCanvas.getContext("2d");

    ctx.clearRect(-offset.x(), -offset.y(), playCanvas.width, playCanvas.height);
    
    for (let racecar of raceInstance.getRacecars()) {
        let pos = racecar.getPosition().scale(spacing);
        let raceStats = raceInstance.getRacecarStats(racecar);

        ctx.fillStyle = "#A00";
        ctx.beginPath();
        ctx.ellipse(pos.x(), pos.y(), racecarRadius, racecarRadius, 0, 2 * Math.PI, 0);
        ctx.fill();

        let racecarPath = raceStats.getPath();

        // first dot of race path
        let firstDot = racecarPath[0].scale(spacing);
        ctx.beginPath();
        ctx.ellipse(firstDot.x(), firstDot.y(), 3, 3, 0, 2 * Math.PI, 0);
        ctx.fill();

        for (let p = 0; p < racecarPath.length - 1; p ++) {
            let start = racecarPath[p].scale(spacing);
            let end = racecarPath[p + 1].scale(spacing);

            ctx.strokeStyle = "#A00";
            ctx.beginPath();
            ctx.moveTo(start.x(), start.y());
            ctx.lineTo(end.x(), end.y());
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(end.x(), end.y(), 3, 3, 0, 2 * Math.PI, 0);
            ctx.fill();
        }
    }
}


// displays the available subsequent velocities for the player
function displayMoves(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let move of moves) {
        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        let ctx = playCanvas.getContext("2d");
        ctx.strokeStyle = move.Active ? "#A00" : "#999";
        ctx.beginPath();
        ctx.ellipse(pos.x(), pos.y(), spotRadius, spotRadius, 0, 2 * Math.PI, 0);
        ctx.stroke();
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