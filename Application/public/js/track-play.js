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

var spacing = 25;                           // pixels between each grid cell
var spotRadius = (spacing / 2) * 0.85;      // move choices
var racecarRadius = spotRadius * 0.75;      // race car visual
var pointRadius = racecarRadius * 0.35;     // path joints
var offset = new Vector2();

var timeElapsed = 0;



// [[ Gameplay & Controls ]] //

function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x, 
        y - rect.top  - offset.y
    );
}

function loadTrack(trackToLoad, racecarId) {
    let track = Track.toInstance(trackToLoad);
    let racecarType = Object.values(RACECAR_INFO).find((r) => r.Id == racecarId)

    trackRenderer = new TrackRenderer(track, trackCanvas, spacing);
    trackRenderer.setVisibility("nodes", false);
    trackRenderer.setVisibility("wires", false);
    trackRenderer.redrawTrack();

    raceRenderer = new CanvasRenderer(playCanvas);

    let racecar = new RaceCar();
    racecar.setType(racecarType.Name);

    raceInstance = new RaceInstance(track, [racecar], spacing);

    renderRacecars();

    timeElapsed = 0;
    displayMoves(racecar, raceInstance.getPossibleMoves(racecar));
    updateRaceHeader();
    updateLiveStats(racecar);
}

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

        // move race car to location & update stats
        // * applies the current selected move, and any further moves
        //     if all subsequent ones are offscreen (to prevent locking)
        let stats = raceInstance.getRacecarStats(racecar);

        while (true) {
            raceInstance.moveRacecar(racecar, target);
            renderRacecars();

            timeElapsed += 1;
            updateRaceHeader();
            updateLiveStats(racecar);            

            if (stats.getState() == RACECAR_STATE.Racing) {
                let nextMoves = raceInstance.getPossibleMoves(racecar);

                if (isOnScreenMoveAvailable(racecar, nextMoves)) {
                    displayMoves(racecar, nextMoves);
                    break;

                } else {
                    target = new Vector2(0, 0);
                }
            
            } else {
                endRace(stats);
                break;
            }
        }
    });
}

function initialiseResultsPopup() {
    let buildBtn = document.getElementById("results-build");
    let retryBtn = document.getElementById("results-retry");

    retryBtn.addEventListener("click", (e) => {

        // TODO: generalise this
        let racecar = raceInstance.getRacecars()[0];
        let stats = raceInstance.getRacecarStats(racecar);

        if (stats.getState() == RACECAR_STATE.Crashed) {
            stats.setState(RACECAR_STATE.Racing);
            
            // restart from the last move
            let moves = stats.getMoves();
            let lastPath = moves[moves.length - 1].Path;
            let lastPos = lastPath.start;

            racecar.setPosition(lastPos);
            racecar.setVelocity(new Vector2());

            renderRacecars();
            displayMoves(racecar, raceInstance.getPossibleMoves(racecar));
            updateLiveStats(racecar);
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

function endRace(stats) {
    let titleText;

    let popup = document.getElementById("modal-race-results");
    let results = popup.getElementsByClassName("results")[0];
    let retryBtn = document.getElementById("results-retry");

    let moveCount = stats.getMoves().length;
    let distance = stats.getDistance().toFixed(3);
    let time = stats.getTime().toFixed(3);
    let topSpeed = stats.getTopSpeed().toFixed(3);
    let averageSpeed = (distance / time).toFixed(3);

    results.innerHTML = 
        `<p>
                <b>Total Moves:</b> ${moveCount}
            <br><b>Distance:</b> ${distance} m
            <br><b>Time:</b> ${time} s
            <br><b>Top Speed:</b> ${topSpeed} m/s
            <br><b>Average Speed:</b> ${averageSpeed} m/s
        </p>`;

    let state = stats.getState();

    if (state == RACECAR_STATE.Crashed) {
        popup.querySelector(".modal-footer").hidden = false;

        let modal = new bootstrap.Modal(popup);
        modal.show();
        
        titleText = "You Crashed!";
        retryBtn.hidden = false;

    } else if (state == RACECAR_STATE.Finished) {
        popup.querySelector(".modal-footer").hidden = true;

        let modal = new bootstrap.Modal(popup);
        modal.show();
        
        titleText = "You Finished the Race!";
        retryBtn.hidden = true;
    }

    let buildBtn = document.getElementById("results-build");
    let buildUrl = `/tracks/build/${raceInstance.getTrack().getId()}`;
    let buildVisible = document.referrer.includes(buildUrl);
    buildBtn.hidden = !buildVisible;

    let title = popup.getElementsByClassName("modal-title")[0];

    title.innerHTML = titleText;
}



// [[ Canvas Visualisations ]] // 

function renderRacecars() {
    raceRenderer.clearCanvas();
    
    for (let racecar of raceInstance.getRacecars()) {
        let pos = racecar.getPosition().scale(spacing);
        let stats = raceInstance.getRacecarStats(racecar);

        raceRenderer.drawCircle(pos, racecarRadius, "#A00");

        let moves = stats.getMoves();

        if (moves.length > 0) {
            let path = moves[0].Path;
            let start = path.start.scale(spacing);
            raceRenderer.drawCircle(start, pointRadius, "#A00");
        }

        for (let move of moves) { // race car path
            let path = move.Path;
            let start = path.start.scale(spacing);
            let end = path.end.scale(spacing);

            raceRenderer.drawLine(start, end, 1, "#A00");
            raceRenderer.drawCircle(end, pointRadius, "#A00");
        }
    }
}

function displayMoves(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let move of moves) {
        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        raceRenderer.drawCircle(pos, spotRadius, move.Active ? "#A00" : "#999", false);
    }
}

function isOnScreenMoveAvailable(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    console.log("---");

    for (let move of moves) {
        if (!move.Active) continue;

        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        console.log(pos, trackCanvas.width, trackCanvas.height);

        if (   0 < (pos.x + spotRadius) && (pos.x - spotRadius) < trackCanvas.width
            && 0 < (pos.y + spotRadius) && (pos.y - spotRadius) < trackCanvas.height)
        {
            return true;
        }
    }

    return false;
}



// [[ Race Stats ]] //

function updateRaceHeader() {
    let raceTime = document.getElementById("race-time");
    raceTime.innerHTML = `<b>Time:</b> ${timeElapsed} seconds`;
}

function updateLiveStats(racecar) {
    let statsBody = document.getElementById("stats-body");
    let stats = raceInstance.getRacecarStats(racecar);
    let content = "";

    let velocity = racecar.getVelocity();
    
    let moveCount = stats.getMoves().length;
    let distance = stats.getDistance().toFixed(3);
    let topSpeed = stats.getTopSpeed().toFixed(3);
    let avgSpeed = (distance / stats.getTime()).toFixed(3);

    avgSpeed = isNaN(avgSpeed) ? 0 : avgSpeed;

    content += `
        <span> <b>Velocity:</b> (${velocity.x}, ${-velocity.y}) m/s </span>
        <hr>
        <span> <b>Moves:</b> ${moveCount} </span>
        <span> <b>Distance:</b> ${distance} m </span>
        <span> <b>Top Speed:</b> ${topSpeed} m/s </span>
        <span> <b>Avg. Speed:</b> ${avgSpeed} m/s </span>
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



// [[ Set Up ]] //

initialisePlayCanvas();

initialiseResultsPopup();

loadTrack(window.track, window.racecarId);

lucide.createIcons();