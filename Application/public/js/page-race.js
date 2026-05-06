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
    Lobby, RaceCar, RaceInstance,
    RACECAR_STATE, PLAYER_TYPE,
    Validator
} from "/core/index.js";

import { initAuth, signInWithGoogle } from "./firebase.js";
import { getDatabase, ref, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

import GeneralUI from "./utilities/general-ui.js";

lucide.createIcons();



// [[ Variables ]] //   

const db = getDatabase();

var user = await initAuth();
var playerId = user.uid;

var isOnline = false;

var trackRenderer = null;
var raceRenderer = null;

var trackCanvas = document.getElementById("track-canvas");
var playCanvas = document.getElementById("play-canvas");

var spacing = 25;                           // pixels between each grid cell
var spotRadius = (spacing / 2) * 0.85;      // move choices
var racecarRadius = spotRadius * 0.75;      // race car visual
var pointRadius = racecarRadius * 0.35;     // path joints
var offset = new Vector2();

var racecarSprite;



// [[ Gameplay & Controls ]] //

function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x, 
        y - rect.top  - offset.y
    );
}

function loadTrack(track, race) {

    // track rendering
    trackRenderer = new TrackRenderer(track, trackCanvas, spacing);
    trackRenderer.setVisibility("nodes", false);
    trackRenderer.setVisibility("wires", false);
    trackRenderer.redrawTrack();

    raceRenderer = new CanvasRenderer(playCanvas);
}

function initialisePlayCanvas() {
    let debounce = false;

    playCanvas.addEventListener("click", async (e) => {
        if (!canMakeMove() || debounce) {
            console.log("Cannot move!");
            return;
        }

        debounce = true
        
        let racecar = raceInstance.getCurrentPlayer();
        let racecarId = racecar.getPlayerId();

        // only "one client" when playing locally
        if (isOnline && racecarId != playerId) return;

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

        if (target) {
            sendMoveInput(racecar, target);
        }

        debounce = false;
    });
}

async function sendMoveInput(racecar, move) {
    let racecarId = racecar.getPlayerId();

    let result = await fetch(`/api/races/${raceId}/move?playerId=${racecarId}`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ move })
    }).then(r => r.json());

    if (result.success) {
        console.log("Move processed");
    
    } else {
        console.log("Move failed:", result.error);

        GeneralUI.createToast("Move Failed",
            `Something went wrong when trying to make that move: ${result.error}`,
            "#A00");
    }
}

function initialiseResultsPopup() {
    let buildBtn = document.getElementById("results-build");
    let retryBtn = document.getElementById("results-retry");
    let closeBtn = document.getElementById("results-close");

    function runRetryAndRetirement() {
        let racecars = raceInstance.getRacecars();
        
        let toRetry = [];
        let toRetire = [];

        let resultsPopup = document.getElementById("modal-race-results");
        let results = resultsPopup.getElementsByClassName("results")[0];
        let checkboxes = results.querySelectorAll("[id*='retry-racecar-']");

        for (let box of checkboxes) {
            let index = box.dataset.number;
            let racecar = racecars[index];
            box.checked ? toRetry.push(racecar) : toRetire.push(racecar);
        }

        retryRacecars(toRetry);
        retireRacecars(toRetire);

        turn = -1; // TODO: hacky way to set turn to start
        raceInstance.findNextTurn();
    }

    buildBtn.addEventListener("click", async (e) => {
        let buildUrl = `/builder/${track.getId()}`;
        let canBuild = document.referrer.includes(buildUrl);

        // TODO: make this more secure

        if (canBuild) {
            onDisconnect(raceRef).remove();
            window.location.href = buildUrl;
        }
    });

    retryBtn.addEventListener("click", (e) => {
        runRetryAndRetirement();
    });

    closeBtn.addEventListener("click", (e) => {      
        if (!retryBtn.hidden) runRetryAndRetirement();
    });
}

function endRace(state) {
    let resultsPopup = document.getElementById("modal-race-results");
    let results = resultsPopup.getElementsByClassName("results")[0];
    let retryBtn = document.getElementById("results-retry");

    var resultsModal = new bootstrap.Modal(resultsPopup, {backdrop: "static"});

    let racecars = raceInstance.getRacecars();
    let ranks = getRankedRacecars();

    let buckets = Object.keys(PLAYER_TYPE).map(k => {
        return racecars.filter(r => r.getPlayerType() == PLAYER_TYPE[k]);
    });
    buckets.unshift(undefined); // hacky: to accommodate 1-n enum numbering

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
        let playerType = racecar.getPlayerType();
        let colour = racecar.getColour();
        
        let bucket = buckets[playerType];
        let number = bucket.findIndex(r => r == racecar) + 1;
        
        let name = raceInstance.getLobby().getPlayers()[racecar.getPlayerId()].getName();

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
        resultsPopup.querySelector(".modal-footer").style.display = "block";
        resultsModal.show();

        // race cars to retire / continue
        let toggleAll = document.createElement("div");
        toggleAll.innerHTML = `
            <input id="retry-all" class="form-check-input" type="checkbox" checked>
            <label class="form-check-label ms-2" for="retry-all"><b>Select All</b></label>
        `;

        let checkboxAll = toggleAll.querySelector("#retry-all");
        checkboxAll.addEventListener("change", (e) => {
            let value = checkboxAll.checked;
            let checkboxes = results.querySelectorAll("[id*='retry-racecar-']");
            for (let checkbox of checkboxes) checkbox.checked = value;
        });

        results.append(toggleAll);

        let retries = document.createElement("div");
        retries.id = "retries-list";

        let racecars = raceInstance.getRacecars();
        let crashes = racecars.filter(r => {
            let stats = raceInstance.getRacecarStats(r);
            return stats.getState() == RACECAR_STATE.Crashed;
        });

        crashes.forEach((racecar, i) => {
            let entry = document.createElement("div");

            let playerType = racecar.getPlayerType();
            let bucket = buckets[playerType];
            let number = bucket.findIndex(r => r == racecar) + 1;
        
            let name = raceInstance.getLobby().getPlayers()[racecar.getPlayerId()].getName();
            
            let index = racecars.findIndex(r => r == racecar);
            let checkbox = `<input id="retry-racecar-${index}" class="form-check-input" type="checkbox" data-number=${index} checked>`;
            let label = `<label class="form-check-label ms-2" for="retry-racecar-${index}">${name}</label>`;

            entry.innerHTML = `${checkbox} ${label}`;
            results.appendChild(entry);
        });
        
        // title & footer
        titleText = "A Player Crashed!";
        retryBtn.hidden = false;

    } else if (state == RACECAR_STATE.Finished) {
        resultsPopup.querySelector(".modal-footer").style.display = "block";
        resultsModal.show();

        handleLeaderScore();
        
        titleText = "The Race is Over!";
        retryBtn.hidden = true;
    }

    // other popup stuff
    let buildBtn = document.getElementById("results-build");
    let buildUrl = `/builder/${track.getId()}`;
    let buildVisible = document.referrer.includes(buildUrl);
    buildBtn.hidden = !buildVisible;

    let title = resultsPopup.getElementsByClassName("modal-title")[0];

    title.innerHTML = titleText;
}

// server?
function getRankedRacecars() {
    let racecars = raceInstance.getRacecars();

    let ranks = racecars.toSorted((a, b) => {
        let stats1 = raceInstance.getRacecarStats(a);
        let stats2 = raceInstance.getRacecarStats(b);

        let retired1 = stats1.getState() == RACECAR_STATE.Retired;
        let retired2 = stats2.getState() == RACECAR_STATE.Retired;

        let time1 = stats1.getTime();
        let time2 = stats2.getTime();

        // if racing, sort in ascending time (faster = better)
        // if retired, sort in descending time (duration = better)
        // retirees are below active / finished racers

        if (retired1 && retired2) {
            return time2 - time1;

        } else if (retired1 || retired2) {
            return retired1 ? 1 : -1;
        
        } else {
            return time1 - time2;
        }
    });

    return ranks;
}

// server
function handleLeaderScore() {
    // TODO: let's say a player has a game with 2 local players
    // * it seems "okay" for both players to be able to contribute
    //     to a new highscore, even in multiplayer
    // * there's no real "unfairness"

    // bottom line: only applies to players, not robots

    let ranks = getRankedRacecars();
    let leader = ranks.find(r => {
        let stats = raceInstance.getRacecarStats(r);
        let state = stats.getState();
        let playerType = r.getPlayerType();

        return state == RACECAR_STATE.Finished
            && playerType == PLAYER_TYPE.Player
    });
    if (!leader) return;

    let player = raceInstance.getLobby().getPlayers()[leader.getPlayerId()];
    let stats = raceInstance.getRacecarStats(leader);
    let carType = leader.getCarType();
    let time = stats.getTime();
    let moves = stats.getMoves();

    saveRecordToLeaderboard(player, time, carType, moves)
}

// server
async function saveRecordToLeaderboard(player, time, carType, moves) {
    // TODO: sanitise
    
    // track ID defined at Set Up
    async function saveScore() {
        try {
            let data = {player, time, carType, moves};

            let response = await fetch(`/api/leaderboards/${trackId}`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify( data )
            });

            let result = await response.json();

            let oldTime = result.oldTime ?? null;
            let newTime = result.newTime;
            let better = !oldTime || newTime < oldTime;

            let oldTimeF = oldTime ? oldTime.toFixed(3) : null;
            let newTimeF = newTime.toFixed(3);

            if (better) {
                let popup = document.getElementById("modal-race-results");
                let results = popup.getElementsByClassName("results")[0];
                let text = "";

                if (oldTimeF) {
                    let diff = (oldTime - newTime).toFixed(3);
                    text = `<b>New Record (${carType}):</b> ${newTimeF} s <i>(${diff} s faster, from ${oldTimeF} s)</i>`;

                } else {
                    text = `<b>New Record (${carType}):</b> ${newTimeF} s`;
                }
                
                let span = document.createElement("span");
                span.innerHTML = text
                span.style.color = "#0A0";

                results.appendChild(span);
            }

            return true;

        } catch(error) {
            console.log(error);
            return false;
        }
    }

    if (user.isAnonymous) {
        GeneralUI.createToast("Unsaved Score",
            "You earned yourself a new record, sign in to save it!",
            "#0A0");

        let debounce = false;
        let signInBtn = document.getElementById("results-sign-in-google");
        signInBtn.hidden = false;

        signInBtn.addEventListener("click", async (e) => {
            if (debounce || !user.isAnonymous) return;
            debounce = true;

            let userResult = await signInWithGoogle();
            
            if (userResult) {
                user = userResult;
                playerId = userResult.uid;
                saveScore();

                signInBtn.classList.add("btn-success");
                signInBtn.classList.remove("btn-primary");
                signInBtn.querySelector("span").innerHTML =
                    `Signed in as "${user.displayName}"`;
            
            } else {
                GeneralUI.createToast("Failed Sign In",
                    "Something went wrong when trying to sign in.",
                    "#A00");
            }

            debounce = false;
        });
        
    } else {
        saveScore();
    }
}



// [[ Canvas Visualisations ]] // 

// client
function renderRacecars() {
    raceRenderer.clearCanvas();

    let racecars = raceInstance.getRacecars();

    let racerInfo = Object.keys(PLAYER_TYPE).map(k => {
        return ({Count: 0, Symbol: k.substring(0, 1)})
    });
    racerInfo.unshift(undefined); // hacky: to accommodate 1-n enum numbering
    
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
        let useImage = true;

        if (!useImage) {
            raceRenderer.drawCircle(pos, racecarRadius, colour);
        
        } else {
            let imageSize = new Vector2(40, 40 * (364 / 677));
            let imagePos = pos.sub(imageSize.scale(0.5));
            let angle = 0

            let velocity = racecar.getVelocity();

            // orienting the car according to velocity,
            //   or the last "direction" if stationary,
            //   or the track direction if starting
            if (velocity.mag() > 0) {
                let velocity = racecar.getVelocity();
                angle = Math.atan2(velocity.y, velocity.x);

            } else {
                if (moves.length > 0) {
                    let move = moves[moves.length - 1];

                    for (let m = moves.length - 1; m >= 0; m--) {
                        let vel = moves[m].Velocity;

                        if (vel.mag() > 0) {
                            move = moves[m];
                            break;
                        }
                    }

                    let path = move.Path;
                    let diff = path.end.sub(path.start);
                    angle = Math.atan2(diff.y, diff.x);

                } else {
                    let track = raceInstance.getTrack();
                    let tpath = track.getPath();
                    let direction = tpath[1].getPosition().sub(tpath[0].getPosition());
                    angle = Math.atan2(direction.y, direction.x);
                }
            }

            raceRenderer.drawImage(racecarSprite, imagePos.x, imagePos.y, 
                imageSize.x, imageSize.y, angle, colour);
        }

        // race car label
        let playerType = racecar.getPlayerType();
        let info = racerInfo[playerType];
        info.Count += 1;

        let symbol = info.Symbol;
        let count = info.Count;

        raceRenderer.drawText(`${symbol}${count}`, pos, racecarRadius + 2);
    });
}

// client
function displayMoves(racecar, moves) {
    let centre = racecar.getPosition().add(racecar.getVelocity());
    let colour = racecar.getColour();

    for (let move of moves) {
        let gridPos = centre.add(move.Offset);
        let pos = gridPos.scale(spacing);

        raceRenderer.drawCircle(pos, spotRadius, move.Active ? colour : "#999", false);
    }
}

function canMakeMove() {
    let racecar = raceInstance.getCurrentPlayer();

    if (
        !isOnline 
        || (racecar && racecar.getPlayerId() == playerId) 
    ) {
        let stats = raceInstance.getRacecarStats(racecar);
        let state = stats.getState();

        if (state == RACECAR_STATE.Racing) {
            return true;
        }
    }
}

// client?
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
    let elapsedTime = raceInstance.getElapsedTime();

    let raceTime = document.getElementById("race-time");
    raceTime.innerHTML = `<b>Time:</b> ${elapsedTime} seconds`;
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

    racecars = racecars.toSorted((a, b) => // sorted copy
        a.getPlayerType() - b.getPlayerType());

    racecars.forEach((racecar, index) => {
        if (racecar.getPlayerType() == PLAYER_TYPE.Ghost) return;

        let entry = createRaceStatsEntry(racecar);
        let header = entry.querySelector(".stats-header");
        let collapse = entry.querySelector(".accordion-collapse");

        // additional info
        let lobby = raceInstance.getLobby();
        let player = lobby.getPlayers()[racecar.getPlayerId()];
        let playerType = racecar.getPlayerType();
        let carType = racecar.getCarType();
        let stats = raceInstance.getRacecarStats(racecar);
        let state = stats.getState();
        
        let level = "";
        if (playerType == PLAYER_TYPE.Robot) {
            let levelValue = lobby.getPlayerDetail(player.getId(), "level");
            level = `<i>(Level ${levelValue})</i> `;
        }
        
        let stateName = Object.keys(RACECAR_STATE).find(s => RACECAR_STATE[s] == state);

        header.innerHTML = `<span>
            <b>${player.getName()}</b> - ${carType} ${level}<i>(${stateName})</i>
        </span>`;

        // accordion bindings
        let collapseId = `stats-collapse-${index}`;
        header.setAttribute("data-bs-target", `#${collapseId}`);
        collapse.setAttribute("id", collapseId);

        statsList.appendChild(entry);
    });
}



// [[ UI Updating ]] //

function validateEligibility() {
    
    // must be a part of the race
    let players = raceInstance.getLobby().getPlayers() 
    
    if (!players[playerId]) {
        window.location.href = "/tracks";
        return;
    }
}


function onInstanceUpdate() {
    console.log("Updated - Current Turn:", raceInstance.getTurn());

    updateRaceHeader();
    
    updateRaceStats();

    renderRacecars();

    let racecar = raceInstance.getCurrentPlayer();

    // race finished
    if (!raceInstance.isAnyRacecarInState(RACECAR_STATE.Racing)) {
        endRace(RACECAR_STATE.Finished);
    }

    // race ongoing
    if (canMakeMove()) {
        let moves = raceInstance.getPossibleMoves(racecar);

        if (!isOnScreenMoveAvailable(racecar, moves)) {
            sendMoveInput(racecar, moves[0]);
            // all off screen, so any move will do
        
        } else {
            displayMoves(racecar, moves);

            GeneralUI.createToast("Your Turn",
                `<b>${user.displayName}</b>, it's your turn to make a move!`,
                "#59F");
        }
    }
}



// [[ Set Up ]] //

let raceId = raceId_;

let raceJson = await fetch(`/api/races/${raceId}`).then(r => r.json());
let raceInstance = RaceInstance.toInstance(raceJson.race);

isOnline = raceInstance.getLobby().getIsOnline();

let trackId = raceInstance.getLobby().getTrackId();
let trackJson = await fetch(`/api/tracks/${trackId}`).then(r => r.json());
let track = Track.toInstance(trackJson.track);

let introTitle = document.getElementById("intro-title");
introTitle.innerHTML = `Welcome to <b>${track.getName()}</b>! Start your engines...`;

let leaderboardJson = await fetch(`/api/leaderboards/${track.getId()}`).then(r => r.json());
let leaderboard = leaderboardJson.leaderboard;

if (!raceInstance.getLobby().getPlayers()[playerId]) {
    windows.location.href = "/tracks";
}

racecarSprite = new Image();
racecarSprite.src = "/images/race-car-sprite-nobg.png";

racecarSprite.onload = () => { // TODO: make this independent
    validateEligibility();

    loadTrack(track, raceInstance);

    initialisePlayCanvas();

    initialiseResultsPopup();

    onInstanceUpdate();
}



// [[ Firebase Connection ]] //

var raceRef = ref(db, `races/${raceId}`);

onValue(raceRef, (snapshot) => {
    let raceData = snapshot.val();
    if (!raceData) return;

    // reconstructing race
    raceInstance = RaceInstance.toInstance(raceData);

    validateEligibility();

    onInstanceUpdate();
});


let playerStatsIndex = raceInstance.getRaceStats().findIndex(rs => rs.getPlayerId() == playerId);

if (playerStatsIndex > -1) { // STRICT: refresh / leaving WILL retire
    let playerStateRef = ref(db, `/races/${raceId}/raceStats/${playerStatsIndex}/state`);
    onDisconnect(playerStateRef).set( RACECAR_STATE.Retired );
}