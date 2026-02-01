// manages racing gameplay


// [[ Imports ]] //
import {
    Vector2,
    Track,
    CanvasRenderer, TrackRenderer,
    RaceCar, RaceInstance,
    RACECAR_STATE, RACECAR_INFO
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

var timeElapsed = 0;



// [[ Gameplay & Controls ]] //

// loads the given track 
function loadTrack(trackToLoad, racecarId) {
    let track = Track.toInstance(trackToLoad);
    let racecarType = RACECAR_INFO.find((r) => r.Id == racecarId)

    trackRenderer = new TrackRenderer(track, trackCanvas);
    trackRenderer.setVisibility("nodes", false);
    trackRenderer.setVisibility("wires", false);
    trackRenderer.redrawTrack();

    raceRenderer = new CanvasRenderer(playCanvas);

    let racecar = new RaceCar();
    racecar.setType(racecarType);

    raceInstance = new RaceInstance(track, [racecar]);

    renderRacecars();

    timeElapsed = 0;
    displayMoves(racecar, raceInstance.getPossibleMoves(racecar));
    updateRaceHeader();
    updateLiveStats(racecar);
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

        // move car to location & update stats
        raceInstance.moveRacecar(racecar, target);
        renderRacecars();

        timeElapsed += 1;
        updateRaceHeader();
        updateLiveStats(racecar);

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


// prepares the race results popup functionality
function initialiseResultsPopup() {
    let buildBtn = document.getElementById("results-build");
    let retryBtn = document.getElementById("results-retry");

    retryBtn.addEventListener("click", (e) => {

        // TODO: generalise this
        let racecar = raceInstance.getRacecars()[0];
        let raceStats = raceInstance.getRacecarStats(racecar);

        if (raceStats.getState() == RACECAR_STATE.Crashed) {
            raceStats.popFromPath();
            raceStats.setState(RACECAR_STATE.Racing);
            
            let path = raceStats.getPath();
            let lastPos = path[path.length - 1];

            racecar.setPosition(lastPos);
            racecar.setVelocity(new Vector2());

            renderRacecars();
            displayMoves(racecar, raceInstance.getPossibleMoves(racecar));
        }
    });

    buildBtn.addEventListener("click", (e) => {
        let buildUrl = `/tracks/build/${raceInstance.getTrack().getId()}`;
        let canBuild = document.referrer.includes(buildUrl);

        // TODO: make this more secure

        if (canBuild) {
            window.location.href = buildUrl;
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
        popup.querySelector(".modal-footer").hidden = false;

        let modal = new bootstrap.Modal(popup);
        modal.show();
        titleText = "You Crashed!";

    } else if (state == RACECAR_STATE.Finished) {
        popup.querySelector(".modal-footer").hidden = true;

        let modal = new bootstrap.Modal(popup);
        modal.show();
        titleText = "You Finished the Race!";
    }

    let buildBtn = document.getElementById("results-build");
    let buildUrl = `/tracks/build/${raceInstance.getTrack().getId()}`;
    let buildVisible = document.referrer.includes(buildUrl);
    buildBtn.hidden = !buildVisible;

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
        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        raceRenderer.drawCircle(pos, spotRadius, move.Active ? "#A00" : "#999", false);
    }
}


// updates the race header
function updateRaceHeader() {
    let raceTime = document.getElementById("race-time");
    raceTime.innerHTML = `<b>Time:</b> ${timeElapsed} seconds`;
}


// displays the player's live race stats
function updateLiveStats(racecar) {
    let statsBody = document.getElementById("stats-body");
    let stats = raceInstance.getRacecarStats(racecar);
    let content = "";

    let velocity = racecar.getVelocity();
    
    let avgSpeed = stats.getDistance() / stats.getTime();
    avgSpeed = isNaN(avgSpeed) ? 0 : avgSpeed;

    content += `
        <span> <b>Velocity:</b> (${velocity.x()}, ${-velocity.y()}) m/s </span>
        <hr>
        <span> <b>Moves:</b> ${stats.getMoves()} </span>
        <span> <b>Distance:</b> ${stats.getDistance().toFixed(3)} m </span>
        <span> <b>Top Speed:</b> ${stats.getTopSpeed().toFixed(3)} m/s </span>
        <span> <b>Avg. Speed:</b> ${avgSpeed.toFixed(3)} m/s </span>
        <hr>
    `;

    // TOOD: only update this when actually crossing a checkpoint?

    let checkpoints = stats.getCheckpoints();
    
    for (let [index, checkpoint] of checkpoints.entries()) {
        let passed = checkpoint.passed;

        let passedText = `
            <span style="color: ${passed ? '#0A0' : '#C00'}">
                ${passed ? "<b>PASSED!</b>" : "not passed..." }
            </span>
        `;

        content += `
            <span> <b>Checkpoint ${index + 1}:</b> ${passedText} </span>
        `;
    }

    if (checkpoints.length > 0 && !checkpoints[checkpoints.length - 1].passed) {
        content += `<span><br> The race isn't over yet... </span>`;

    } else {
        let br = checkpoints.length > 0 ? "<br>" : "";
        content += `
            <span style="color: #C70">
                ${br} <b><i>GET TO THE FINISH LINE!!!</i></b>
            </span>
        `;
    }

    statsBody.innerHTML = content;
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

initialiseResultsPopup();

loadTrack(window.track, window.racecarId);

lucide.createIcons();