// manages racing gameplay

// source 1: Stack Overflow, "Distance between two numbers in looping numerical sequence", Stack Exchange, stackexchange.com, [Online]. Available at: https://stackoverflow.com/questions/38797186/. Accessed: Mar. 10, 2026.
// source 2: Math Exchange, "shortest distance between a point and a line segment", Stack Exchnage, stackexchange.com, [Online]. Available at: https://math.stackexchange.com/questions/2248617. Accessed: Mar. 11, 2026.


// TODO: sort out the whole "playerCount / robotCount" thing
// * it's REALLY annoying to do...
// * should have PlayerRacer and RobotRacer (extends Racecar)
//     then each kind of car has its own pseudo-ID / number
//     relative to others of its kind


// [[ Imports ]] //
import {
    Vector2,
    Track,
    CanvasRenderer, TrackRenderer,
    RaceCar, RaceInstance,
    RACECAR_STATE, RACER_TYPE
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
var movesToMake = [];                       // list of moves to apply

var timeElapsed = 0;
var turn = 0;
let autoRetry = true;   // TODO: make this an actual option



// [[ Gameplay & Controls ]] //

function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x, 
        y - rect.top  - offset.y
    );
}

function findNextTurn() {
    let racecars = raceInstance.getRacecars();

    function incrementTurn() {
        turn = (turn + 1) % racecars.length;
    }

    while (true) {
        incrementTurn();

        if (turn == 0) applyAllMoves();

        // preliminary checks (no active racers, OR active crashes)
        let isAnyRacing = raceInstance.isAnyRacecarInState(RACECAR_STATE.Racing)
        let isAnyCrashed = raceInstance.isAnyRacecarInState(RACECAR_STATE.Crashed)

        if (!isAnyRacing && !isAnyCrashed) {
            endRace(RACECAR_STATE.Finished);
            break;
        };

        if (isAnyCrashed) return;

        // move determination
        let racecar = racecars[turn];
        let stats = raceInstance.getRacecarStats(racecar);
        let state = stats.getState();
        
        if (state == RACECAR_STATE.Finished || state == RACECAR_STATE.Retired) {
            movesToMake[turn] = undefined;
        
        } else {
            let moves = raceInstance.getPossibleMoves(racecar);

            if (isOnScreenMoveAvailable(racecar, moves)) {
                updateRaceHeader();
                updateRaceStats();
                renderRacecars();
                
                let racerType = racecar.getRacerType();

                if (racerType == RACER_TYPE.Player) {
                    let first = raceInstance.getRacecars()[turn];
                    displayMoves(first, raceInstance.getPossibleMoves(first));

                    break; // this player can actually move
                
                } else if (racerType == RACER_TYPE.Robot) {
                    let move = determineRobotMove(racecar);
                    movesToMake[turn] = move;
                }

            } else {
                movesToMake[turn] = new Vector2();
            }
        }
    }
}

function loadTrack(trackToLoad, racers) {
    let track = Track.toInstance(trackToLoad);

    // track rendering
    trackRenderer = new TrackRenderer(track, trackCanvas, spacing);
    trackRenderer.setVisibility("nodes", false);
    trackRenderer.setVisibility("wires", false);
    trackRenderer.redrawTrack();

    raceRenderer = new CanvasRenderer(playCanvas);

    // race car set up
    let racecars = [];

    for (let racer of racers) {
        let {RacerType, Colour, CarType} = racer;

        let racecar = new RaceCar();
        racecar.setRacerType(RacerType);
        racecar.setCarType(CarType);
        racecar.setColour(Colour);
        racecars.push(racecar);
    }

    // instance creation
    raceInstance = new RaceInstance(track, racecars, spacing);
    timeElapsed = -1; // -1: hacky, to not start at "1" (TODO)
    turn = -1;

    findNextTurn();
}

function initialisePlayCanvas() {
    playCanvas.addEventListener("click", (e) => {
        if (raceInstance.isAnyRacecarInState(RACECAR_STATE.Crashed)) return;

        let racecar = raceInstance.getRacecars()[turn];

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

        movesToMake[turn] = target;
        findNextTurn();
    });
}

function initialiseResultsPopup() {
    let buildBtn = document.getElementById("results-build");
    let retireBtn = document.getElementById("results-retire");
    let retryBtn = document.getElementById("results-retry");
    let closeBtn = document.getElementById("results-close");

    buildBtn.addEventListener("click", (e) => {
        let buildUrl = `/tracks/build/${raceInstance.getTrack().getId()}`;
        let canBuild = document.referrer.includes(buildUrl);

        // TODO: make this more secure

        if (canBuild) {
            window.location.href = buildUrl;
        }
    });

    retireBtn.addEventListener("click", (e) => {
        retireRacecars();
    });

    retryBtn.addEventListener("click", (e) => {
        retryRacecars();

        turn = -1; // TODO: hacky way to set turn to start
        findNextTurn();
    });

    closeBtn.addEventListener("click", (e) => {
        retireRacecars();
    });
}

function determineRobotMove(racecar) {
    let spacing = raceInstance.getSpacing();
    let form = raceInstance.getForm();
    let centre = form.getCentre();
    let canvas = trackRenderer.getCanvas();

    let finalMove;

    function getClosestSegmentIndex(position) {
        let closest = -1;
        let bestDistance = Math.sqrt((canvas.width ** 2) + (canvas.height ** 2));

        centre.forEach((segment, s) => {
            let distance = segment.toPoint(position);

            if (distance < bestDistance) {
                bestDistance = distance;
                closest = s;
            }
        });

        return closest;
    }

    // [source 1] returns the distance between two indexes
    // * since segment indexes loop around (esp. in looped tracks)
    function shorterDirection(current, next) {
        let count = centre.length;
        let toRight = (next + count - current) % count;

        return toRight > count / 2 ? -(count - toRight) : toRight; // left / right
    }

    // race car score relative to position along track
    function getMoveScore(move) {
        let pos = racecar.getPosition();
        let oldUiPos = pos.scale(spacing);
        let initial = getClosestSegmentIndex(oldUiPos); 

        let predict = raceInstance.predictMove(racecar, move.Offset);

        let newPos = predict.Position;
        let newUiPos = newPos.scale(spacing);
        let closest = getClosestSegmentIndex(newUiPos);

        let segment = centre[closest];
        let distance = segment.toPoint(newUiPos);
        distance = Math.max(distance, 1);

        // score: rewards progressions close to the centre line
        // * lower score for moving backwards, but not "penalised"
        let progress = shorterDirection(initial, closest);
        let score = Math.log(1 / distance) + progress;

        let favour = favours[predict.State];
        if (favour) score += favour;

        // console.log(initial, closest, progress, score);

        return score;
    }

    // looks ahead to find the best sequence of moves to make
    let favours = {
        [RACECAR_STATE.Crashed]:  -10,
        [RACECAR_STATE.Finished]:  100
    } 

    let deterministic = false;
    let maxDepth = 3;
    let depth;
    let randomRisk;
    // # of predicted moves beyond the first move

    if (deterministic) {
        depth = 3;
        randomRisk = 3;
    } else {
        depth = Math.floor(Math.random() * maxDepth);
        randomRisk = 1 / 10**maxDepth;
    }

    function runRecursion(d) {
        let moves = raceInstance.getPossibleMoves(racecar);
        let bestScore = -100;

        if (Math.random() < randomRisk) {
            return 10; // false favour
        }

        for (let move of moves) {
            if (!move.Active) continue;

            let score = getMoveScore(move);

            if (d > 0) {
                let originalPos = racecar.getPosition();
                let originalVel = racecar.getVelocity();

                let next = raceInstance.predictMove(racecar, move.Offset);

                if (next.State == RACECAR_STATE.Crashed) { // simulate crash
                    racecar.setPosition(originalPos);
                    racecar.setVelocity(new Vector2());

                } else {
                    racecar.setPosition(next.Position);
                    racecar.setVelocity(next.Velocity);
                }

                score += runRecursion(d - 1);

                racecar.setPosition(originalPos); // hacky reset per move (TODO)
                racecar.setVelocity(originalVel);
            }

            if (score > bestScore) {
                bestScore = score;
                if (d == depth) finalMove = move.Offset;
            }
        }

        return bestScore;
    }

    runRecursion(depth);

    return finalMove;
}

function applyAllMoves() {
    let racecars = raceInstance.getRacecars();
    let crashed = [];

    for (let r = 0; r < racecars.length; r++) {
        let move = movesToMake[r];
        if (!move) continue;
        
        let racecar = racecars[r];
        let stats = raceInstance.getRacecarStats(racecar);

        raceInstance.moveRacecar(racecar, move);
        
        if (stats.getState() == RACECAR_STATE.Crashed) {
            crashed.push(racecar);
            stats.addCrash();
        }
    }

    if (crashed.length > 0) {
        let playersCrashed = crashed.some(
            r => r.getRacerType() == RACER_TYPE.Player);

        if (!playersCrashed && autoRetry) {
            retryRacecars();

        } else {
            endRace(RACECAR_STATE.Crashed);
        }
    }

    movesToMake = [];
    timeElapsed += 1;
    turn = 0;

    updateRaceHeader();
    updateRaceStats();
    renderRacecars();
}

function retryRacecars() {
    let racecars = raceInstance.getRacecars();

    for (let racecar of racecars) {
        let stats = raceInstance.getRacecarStats(racecar);

        if (stats.getState() == RACECAR_STATE.Crashed) {
            stats.setState(RACECAR_STATE.Racing);
            
            // restart from the last move
            let moves = stats.getMoves();
            let lastPath = moves[moves.length - 1].Path;
            let lastPos = lastPath.start;

            racecar.setPosition(lastPos);
            racecar.setVelocity(new Vector2());
        }
    }
}

function retireRacecars() {
    // defaults to retiring
    let racecars = raceInstance.getRacecars();
    let crash = false;

    for (let racecar of racecars) {
        let stats = raceInstance.getRacecarStats(racecar);

        if (stats.getState() == RACECAR_STATE.Crashed) {
            stats.setState(RACECAR_STATE.Retired);
            crash = true;
        }
    }

    // TODO: hacky - used to determine whether popup showed from
    //   a crash or from the race finishing (if the former, then continue)
    if (crash) {
        turn = -1; // TODO: hacky way to set turn to start
        findNextTurn();
    }
}

function endRace(state) {
    let popup = document.getElementById("modal-race-results");
    let results = popup.getElementsByClassName("results")[0];
    let retryBtn = document.getElementById("results-retry");

    let racecars = raceInstance.getRacecars();
    let playerCount = 0;
    let robotCount = 0;

    // ranking by speed 
    let ranks = racecars.toSorted((a, b) => {
        let stats1 = raceInstance.getRacecarStats(a);
        let stats2 = raceInstance.getRacecarStats(b);

        let state1 = stats1.getState();
        let state2 = stats2.getState();

        let time1 = stats1.getTime();
        let time2 = stats2.getTime();

        // if racing, sort in ascending time (faster = better)
        // if retired, sort in descending time (duration = better)

        return state1 - state2 // 0 diff = false (ie. equal states)
            || (state1 == RACECAR_STATE.Retired) ? time2 - time1 : time1 - time2;
    });

    // table construction
    function getResultsRow(racecar) {
        let stats = raceInstance.getRacecarStats(racecar);
        stats.calculateStats();

        // data
        let state = stats.getState();
        let moveCount = stats.getMoves().length;
        let distance = stats.getDistance().toFixed(3);
        let time = stats.getTime().toFixed(3);
        let topSpeed = stats.getTopSpeed().toFixed(3);
        let averageSpeed = (distance / time).toFixed(3);
        let crashes = stats.getCrashes();

        // racer name in row
        let racerType = racecar.getRacerType();
        let colour = racecar.getColour();
        
        let count = 0;

        if (racerType == RACER_TYPE.Player) {
            playerCount += 1;
            count = playerCount;
            
        } else if (racerType == RACER_TYPE.Robot) {
            robotCount += 1;
            count = robotCount;
        }

        let prefix = Object.keys(RACER_TYPE).find(k => RACER_TYPE[k] == racerType);
        let name = `${prefix} ${count}`;

        let data = [name, time, moveCount, distance, topSpeed, averageSpeed, crashes];

        // actual data row (with state highlight)
        let rank = ranks.findIndex(r => r == racecar) + 1;
        
        let tr = document.createElement("tr");
        tr.innerHTML = `<th scope="row">${rank}</th>`;

        if (state == RACECAR_STATE.Retired) {
            tr.classList.add("table-danger");

        } else if (state == RACECAR_STATE.Crashed) {
            tr.classList.add("table-warning");
        }

        for (let value of data) {
            let td = document.createElement("td");
            td.innerHTML = value;
            tr.appendChild(td);
        }

        tr.childNodes[1].style.color = colour; // name field
        tr.childNodes[1].style.fontWeight = "bold";

        return tr;
    }

    function getResultsTable() {
        let table = document.createElement("table");
        table.classList.add("table", "table-light", "table-bordered", "text-center");

        // headers
        let thead = document.createElement("thead");
        let theadr = document.createElement("tr");
        let headers = ["Rank", "Name", "Time (s)", "Moves", "Distance (m)", "Top Speed (m/s)", "Avg. Speed (m/s)", "Crashes"];

        for (let header of headers) {
            let th = document.createElement("th");
            th.classList.add("text-center");
            th.innerHTML = header;
            theadr.appendChild(th);
        }

        theadr.classList.add("table-secondary");
        thead.appendChild(theadr);

        // data rows
        let tbody = document.createElement("tbody");

        for (let racecar of ranks) {
            let resultsRow = getResultsRow(racecar);
            tbody.appendChild(resultsRow);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    // popup display
    let titleText;

    let resultsTable = getResultsTable();
    results.innerHTML = "";
    results.appendChild(resultsTable);

    if (state == RACECAR_STATE.Crashed) {
        popup.querySelector(".modal-footer").hidden = false;

        let modal = new bootstrap.Modal(popup, {backdrop: "static"});
        modal.show();
        
        titleText = "A Player Crashed!";
        retryBtn.hidden = false;

    } else if (state == RACECAR_STATE.Finished) {
        popup.querySelector(".modal-footer").hidden = true;

        let modal = new bootstrap.Modal(popup, {backdrop: "static"});
        modal.show();
        
        titleText = "The Race is Over!";
        retryBtn.hidden = true;
    }

    // other popup stuff
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

    let racecars = raceInstance.getRacecars();
    let playerCount = 0;
    let robotCount = 0;
    
    racecars.forEach((racecar, r) => {
        let pos = racecar.getPosition().scale(spacing);
        let colour = racecar.getColour();

        let stats = raceInstance.getRacecarStats(racecar);
        let moves = stats.getMoves();

        if (moves.length > 0) { // initial point path
            let path = moves[0].Path;
            let start = path.start.scale(spacing);
            raceRenderer.drawCircle(start, pointRadius, colour);
        }

        for (let move of moves) { // race car path
            let path = move.Path;
            let start = path.start.scale(spacing);
            let end = path.end.scale(spacing);

            raceRenderer.drawLine(start, end, 1, colour);
            raceRenderer.drawCircle(end, pointRadius, colour);
        }

        // race car on top
        let symbol = "";
        let count = 0;
        let racerType = racecar.getRacerType();

        if (racerType == RACER_TYPE.Player) {
            playerCount += 1;
            symbol = "P";
            count = playerCount;
            
        } else if (racerType == RACER_TYPE.Robot) {
            robotCount += 1
            symbol = "R";
            count = robotCount;
        }

        raceRenderer.drawCircle(pos, racecarRadius, colour);
        raceRenderer.drawText(`${symbol}${count}`, pos, racecarRadius + 2);
    });
}

function displayMoves(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());
    let colour = racecar.getColour();

    for (let move of moves) {
        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        raceRenderer.drawCircle(pos, spotRadius, move.Active ? colour : "#999", false);
    }
}

function isOnScreenMoveAvailable(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let move of moves) {
        if (!move.Active) continue;

        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

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

function createRaceStatsEntry(racecar) {
    let stats = raceInstance.getRacecarStats(racecar);

    let entryTemplate = document.getElementById("stats-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    let statsBody = entry.querySelector(".stats-body");
    let statsContent = "";
    let checkpointContent = "<span><b>Checkpoints:</b></span>";

    // active stats (velocity & checkpoints)
    // * TOOD: only update this when actually crossing a checkpoint?
    let velocity = racecar.getVelocity();

    let checkpoints = stats.getCheckpoints();
    
    for (let [index, checkpoint] of checkpoints.entries()) {
        let passed = checkpoint.passed;
        let checkpointChecked = passed ? "checked" : "";
        let checkpointBox = `<input type="checkbox" class="form-check-input checkpoint-box disabled-checkbox" ${checkpointChecked} data-checkpoint=${index}>`;
        checkpointContent += checkpointBox;
    }

    let finished = stats.getState() == RACECAR_STATE.Finished;
    let finishChecked = finished ? "checked" : "";
    let finishBox = `<input type="checkbox" class="form-check-input finish-box disabled-checkbox" ${finishChecked}></input>`;
    checkpointContent += finishBox;

    // cumulative stats
    let moveCount = stats.getMoves().length;
    let distance = stats.getDistance().toFixed(3);
    let topSpeed = stats.getTopSpeed().toFixed(3);
    let avgSpeed = (distance / stats.getTime()).toFixed(3);
    let crashes = stats.getCrashes();

    avgSpeed = isNaN(avgSpeed) ? 0 : avgSpeed;

    // displaying final stats
    statsContent += `
        <span> <b>Velocity:</b> (${velocity.x}, ${-velocity.y}) m/s </span>
        <div class="d-flex gap-2">${checkpointContent}</div>
        <hr>
        <span> <b>Moves:</b> ${moveCount} </span>
        <span> <b>Distance:</b> ${distance} m </span>
        <span> <b>Top Speed:</b> ${topSpeed} m/s </span>
        <span> <b>Avg. Speed:</b> ${avgSpeed} m/s </span>
        <span> <b>Crashes:</b> ${crashes} </span>
    `;

    statsBody.innerHTML = statsContent;

    return entry;
}

function updateRaceStats() {
    let racecars = raceInstance.getRacecars();
    let statsList = document.getElementById("race-stats");

    statsList.innerHTML = "";

    let playerCount = 0;
    let robotCount = 0;
    
    racecars = racecars.toSorted((a, b) => // sorted copy
        a.getRacerType() - b.getRacerType());

    racecars.forEach((racecar, index) => {
        let entry = createRaceStatsEntry(racecar);
        let header = entry.querySelector(".stats-header");
        let collapse = entry.querySelector(".accordion-collapse");

        // additional info
        let racerType = racecar.getRacerType();
        let carType = racecar.getCarType();
        let stats = raceInstance.getRacecarStats(racecar);
        let state = stats.getState();
        
        let racerTypeName = Object.keys(RACER_TYPE).find(k => RACER_TYPE[k] == racerType);
        let stateName = Object.keys(RACECAR_STATE).find(s => RACECAR_STATE[s] == state);
        let number;

        if (racerType == RACER_TYPE.Player) {
            playerCount += 1;
            number = playerCount;
        } else if (racerType == RACER_TYPE.Robot) {
            robotCount += 1;
            number = robotCount;
        }

        header.innerHTML = `
            <span>
                <b>${racerTypeName} ${number}</b> - ${carType}
                <br><i>(${stateName})</i>
            </span>
        `;

        // accordion bindings
        let collapseId = `stats-collapse-${index}`;
        header.setAttribute("data-bs-target", `#${collapseId}`);
        collapse.setAttribute("id", collapseId);

        statsList.appendChild(entry);
    });
}



// [[ Set Up ]] //

initialisePlayCanvas();

initialiseResultsPopup();

loadTrack(window.track, window.racers);

lucide.createIcons();