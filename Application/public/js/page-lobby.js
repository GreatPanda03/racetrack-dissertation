// manages offline lobbies on the client


// [[ Variables ]] //

import {
    Track,
    Lobby, Player,
    PLAYER_TYPE, RACECAR_INFO
} from "/core/index.js";

import GeneralUI from "./utilities/general-ui.js";

import { initAuth } from "./firebase.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

lucide.createIcons();



// [[ Variables ]] //

var user = await initAuth();
var playerId = user.uid;

var db = getDatabase();

var lobby;
var isHost = false;
var isOnline;



// [[ Data Operations ]] //

async function getTrack(trackId) {
    let trackJson = await fetch(`/api/tracks/${trackId}`).then(r => r.json());
    let track = Track.toInstance(trackJson.track);

    return track;
}

async function getLeaderboard(trackId) {
    let lbJson = await fetch(`/api/leaderboards/${trackId}`).then(r => r.json());
    let leaderboard = lbJson.leaderboard;

    return leaderboard;
}

function sortLeaderboardScores(leaderboard) {
    let sortedScores = Object.entries(leaderboard.scores)
        .flatMap(([player, cars]) =>
            Object.entries(cars).map(([carType, score]) => ({
                player, carType, ...score
            }))
        )
        .sort((a, b) => a.time - b.time);

    return sortedScores;
}



// [[ Key Lobby Operations ]] //

function findFreeRacerId() {
    let targets = Object.values(lobby.getPlayers());
    let id = 0;

    do {
        let exists = targets.find(t => t.getId() == id.toString());
        if (exists != undefined) id += 1; else break;
    } while (true)

    return id.toString();
}

function addDefaultRacer(playerType, id) {
    let carType = Object.keys(RACECAR_INFO)[0];

    let details = lobby.getPlayerDetails();
    let colours = Object.values(details).map(d => d.colour);
    let colour = GeneralUI.generateUniqueColourFromNumber(colours, 0);

    let prefix = Object.keys(PLAYER_TYPE).find(k => PLAYER_TYPE[k] == playerType);
     
    id = id || findFreeRacerId();
    let name = `${prefix} ${id}`;
    let player = new Player(id, name, playerType);

    lobby.addPlayer(player);
    lobby.setPlayerDetail(id, "carType", "The Race Car");
    lobby.setPlayerDetail(id, "colour", colour);

    return player;
}

function addPlayer() {
    let player = addDefaultRacer(PLAYER_TYPE.Player);
}

function addRobot() {
    let robot = addDefaultRacer(PLAYER_TYPE.Robot);
    lobby.setPlayerDetail(robot.getId(), "level", 1);
}

function addGhost() {
    let ghost = addDefaultRacer(PLAYER_TYPE.Ghost);
}

async function leaveLobby() {
    let lobbyId = lobby.getId();

    if (isOnline) {
        let lobbyRef = ref(db, `lobbies/${lobbyId}`);
        let playerRef = ref(db, `lobbies/${lobbyId}/players/${playerId}`);

        // If host → delete entire lobby
        if (isHost) {
            await remove(lobbyRef);
        } else {
            // Otherwise just remove player
            await remove(playerRef);
        }
    } else {
        window.location.href = "/tracks";
    }
}



// [[ Static UI ]] //

function updatePageDescription() {
    let description = document.getElementById("page-description");
    let state = isOnline ? "online" : "offline";

    description.innerHTML = `<p>You're in a lobby to play an <b>${state}</b> game.</p>`;

    if (isHost) {
        description.innerHTML += `<p><b>You're the lobby host!</b> 
            You can set the settings for the lobby below. You can start the game whenever you're ready.</p>`;
    }
}

function updateTrackDetails(track) {
    let infoBody = document.getElementById("details-info");

    infoBody.innerHTML = `
        <div style="text-align: start">
            <div> <b>Name:</b> ${track.getName()} </div>
            <div> <b>Description:</b> ${track.getDescription()} </div>
            <div> <b>Author:</b> ${track.getAuthor()} </div>
        </div>`;

    let canvas = document.getElementById("details-canvas");

    GeneralUI.generateTrackPreview(canvas, track, 25);
}

function updateLeaderboard(leaderboard) {
    let lbBody = document.getElementById("details-leaderboard");
    lbBody.innerHTML += "<div class='text-center'><b>Track Times</b></div>";

    let lbContent = null;

    if (leaderboard && Object.keys(leaderboard.scores).length > 0) {
        let sortedScores = sortLeaderboardScores(leaderboard);
        lbContent = constructLeaderboard(sortedScores);

    } else {
        lbContent = document.createElement("span");
        lbContent.innerHTML = "This track has no records - be the first to set one!";
    }

    lbBody.appendChild(lbContent);
}

function constructLeaderboard(scores) {
    let table = document.createElement("table");
    table.classList.add("table", "table-light", "table-bordered", "text-center");

    // headers
    let thead = document.createElement("thead");
    let theadr = document.createElement("tr");
    let headers = ["#", "Name", "Time (s)", "Car Type", "Date", "Ghost"];

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
    let rank = 1;

    for (let row of scores) {
        let tr = document.createElement("tr");
        tr.innerHTML = `<th scope="row">${rank}</th>`;

        let name = row.player;
        let time = row.time.toFixed(3);
        let carType = row.carType || Object.keys(RACECAR_INFO)[0];
        let date = new Date(row.date).toISOString().split("T")[0];
        let data = [name, time, carType, date];

        for (let value of data) {
            let td = document.createElement("td");
            td.innerHTML = value;
            tr.appendChild(td);
        }

        // * TODO: move this to "prepareControls_leaderboard"

        let ghostBox = document.createElement("td");
        ghostBox.innerHTML = `<label style="display: inline-block; width: 100%; height: 100%;">
            <input class="form-check-input mt-1" type="checkbox" id="ghost-${rank}"}>
        </label>`;

        let inputBox = ghostBox.querySelector(".form-check-input");
        let addedGhost = null;

        if (isHost) {
            inputBox.addEventListener("change", (e) => {
                if (inputBox.checked) {
                    let id = name;
                    addedGhost = addDefaultRacer(PLAYER_TYPE.Ghost, id);
                    
                    lobby.setPlayerDetail(id, "colour", "#777");
                    lobby.setPlayerDetail(id, "carType", carType)

                    handleNewDetails();

                } else {
                    if (addedGhost) {
                        lobby.removePlayer(addedGhost)
                        handleNewDetails();
                    }
                }
            });
        } else {
            inputBox.disabled = true;
        }

        tr.appendChild(ghostBox); // add ghost to race
        
        tbody.appendChild(tr);
        rank += 1;
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

function updateRacerListHeaders() {
    let options = document.getElementById("race-options");

    for (let key in PLAYER_TYPE) { 
        let lower = key.toLowerCase();
        let list = document.getElementById(`${lower}-racers-list`);
        let label = document.getElementById(`${lower}-racers-label`);
        label.innerHTML = `${key} Racers (${list.children.length})`;
    }
}

function createRacerEntry(racer) {
    let entryTemplate = document.getElementById("racer-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    // colour
    let colour = lobby.getPlayerDetail(racer.getId(), "colour");

    let colourMarker = entry.querySelector(".racer-colour");
    let colourBtn = entry.querySelector(".btn-racer-colour");
    let colourPicker = colourBtn.querySelector("input");

    colourMarker.setAttribute("fill", colour);
    
    colourBtn.setAttribute("fill", colour);
    colourBtn.setAttribute("stroke", colour);
    colourPicker.value = colour;

    // available car types
    let carTypes = entry.querySelector(".dropdown-menu");

    for (let [carType, values] of Object.entries(RACECAR_INFO)) {
        let description = values.Description;
        let maxSpeed = values.MaxSpeed;
        let maxAccel = values.MaxAcceleration;
        
        let fullDescription = `
            ${description}
            <br><b>Max Velocity:</b> (${maxSpeed.x}, ${maxSpeed.y})
            <br><b>Max Accel.:</b> (${maxAccel.x}, ${maxAccel.y})
        `;

        let itemTemplate = document.getElementById("car-type-item-template");
        let item = document.importNode(itemTemplate.content, true);

        let nameElement = item.querySelector(".car-type-name");
        let infoElement = item.querySelector(".car-type-info");

        nameElement.innerHTML = carType;
        infoElement.setAttribute("title", fullDescription);

        carTypes.appendChild(item);
    }

    carTypes.selectedIndex = 0;
    
    return entry;
}

function refreshLobbyOptions() {
    let lobbyOptions = document.getElementById("lobby-options");
    if (!lobbyOptions) return;
    
    for (let element of lobbyOptions.children) {
        let input = element.querySelector("input[type=checkbox]");
        let option = input.dataset.option;
        input.checked = lobby.getOption(option);
    }
}

function refreshRacerDetails() {
    GeneralUI.clearTooltips();

    let racers = Object.values(lobby.getPlayers());

    let lists = {};
    for (let key in PLAYER_TYPE) { 
        let lower = key.toLowerCase();
        let value = PLAYER_TYPE[key];
        let list = document.getElementById(`${lower}-racers-list`);
        lists[value] = list;
        list.innerHTML = "";
    }

    for (let racer of racers) {
        let id = racer.getId();
        let playerType = racer.getPlayerType();
        let carType = lobby.getPlayerDetail(id, "carType")

        let entry = createRacerEntry(racer);

        // naming
        let name = `<b>...</b> - ${carType}`;
        let nameElement = entry.querySelector(".racer-details");
        nameElement.innerHTML = name;

        prepareControls_racerEntry(entry, racer);

        lists[playerType].appendChild(entry);
    }

    // widgets & icons
    lucide.createIcons();
    
    GeneralUI.prepareTooltips();

    updateRacerListHeaders();
}

function refreshLobbyDetails() {
    refreshLobbyOptions();
    refreshRacerDetails();
}

async function handleNewDetails() {
    if (isOnline) {
        await fetch(`/api/lobbies/${lobby.getId()}/online`, {
            method: "PATCH",
            headers: new Headers({ "Content-Type": "application/json"}),
            body: JSON.stringify({ details: lobby })
        });

    } else {
        refreshLobbyDetails();
    }
}



// [[ Dynamic UI Binds ]] //
// * "enabled" means the UI initially exists
//     but this may be further restricted
// * "enabled = false" means it doesn't exist at all

function prepareControls_startRace(enabled) {
    let startBtn = document.getElementById("start-race");

    if (enabled && isHost) {
        startBtn.addEventListener("click", (e) => {
            startRace();
        });
    } else {
        startBtn.remove();
    }
}

function prepareControls_leaveLobby(enabled) {
    let leaveBtn = document.getElementById("leave-lobby");

    if (enabled) {
        leaveBtn.addEventListener("click", async (e) => {
            await leaveLobby(lobby, playerId);
        });
    } else {
        leaveBtn.remove();
    }
}

function prepareControls_lobbyOptions(enabled) {
    let lobbyOptions = document.getElementById("lobby-options");

    if (enabled) {
        if (isHost) {
            for (let element of lobbyOptions.children) {
                let input = element.querySelector("input[type=checkbox]");

                input.addEventListener("change", (e) => {
                    let option = input.dataset.option;
                    let value = input.checked;
                    lobby.setOption(option, value);
                    handleNewDetails();
                });
            }
        } else {
            for (let element of lobbyOptions.children) {
                let input = element.querySelector("input[type=checkbox]");
                input.disabled = true;
            }
        }
    } else {
        lobbyOptions.remove();
    }
}

function prepareControls_addPlayer(enabled) {
    let addPlayerBtn = document.getElementById("player-racers-add");
    let hostId = lobby.getHostId();

    if (enabled && !isOnline && isHost) {
        addPlayerBtn.addEventListener("click", (e) => {
            addPlayer();
            handleNewDetails();
        });
    } else {
        addPlayerBtn.remove();
    }
}

function prepareControls_addRobot(enabled) {
    let addRobotBtn = document.getElementById("robot-racers-add");

    if (enabled && isHost) {
        addRobotBtn.addEventListener("click", (e) => {
            addRobot();
            handleNewDetails();
        });
    } else {
        addRobotBtn.remove();
    }   
}

function prepareControls_leaderboard(enabled) {

}

function prepareControls_racerEntry(entry, targetPlayer) {
    let id = targetPlayer.getId();
    let playerType = targetPlayer.getPlayerType();

    let ONLINE = isOnline;
    let OFFLINE = !isOnline;
    let FOR_PLAYER = playerId == id;

    // colouring
    let colourBtn = entry.querySelector(".btn-racer-colour");
    let colourPicker = colourBtn.querySelector("input");

    if ( 
        OFFLINE 
        || (ONLINE && FOR_PLAYER)
        || (isHost && playerType != PLAYER_TYPE.Player)
    ) {
        colourBtn.addEventListener("click", (e) => {
            let colourPicker = colourBtn.querySelector("input");
            colourPicker.focus();
        });

        colourPicker.addEventListener("change", (e) => {
            let newColour = colourPicker.value;
            lobby.setPlayerDetail(id, "colour", newColour);
            handleNewDetails();
        });
    } else {
        colourBtn.remove();
        colourPicker.remove();
    }

    // car types
    let carTypeList = entry.querySelector(".div-racer-cartype");
    let dropdown = carTypeList.querySelector(".dropdown-menu");

    if ( 
        OFFLINE 
        || (ONLINE && FOR_PLAYER)
        || (isHost && playerType != PLAYER_TYPE.Player)
    ) {
        for (let item of dropdown.children) {
            item.addEventListener("click", (e) => {
                let newCarType = item.querySelector(".car-type-name").innerHTML;
                lobby.setPlayerDetail(id, "carType", newCarType);
                handleNewDetails();
            });
        }
    } else {
        carTypeList.remove();
        dropdown.remove();
    }

    // deletion
    let deleteBtn = entry.querySelector(".btn-racer-remove");

    if ( !FOR_PLAYER && (OFFLINE || (ONLINE && isHost)) ) {
        deleteBtn.addEventListener("click", (e) => {
            lobby.removePlayer(targetPlayer);
            handleNewDetails();
        });
    } else {
        deleteBtn.remove();
    }

    // player type specific
    let levelDiv = entry.querySelector(".div-robot-level");

    if (playerType == PLAYER_TYPE.Robot && isHost) {
        let levelInput = levelDiv.querySelector(".input-robot-level");
        levelInput.value = lobby.getPlayerDetail(id, "level");
        
        levelInput.addEventListener("change", (e) => {
            let newLevel = levelInput.value;
            newLevel = Math.min(Math.max(newLevel, 0), 4);
            lobby.setPlayerDetail(id, "level", newLevel);
            handleNewDetails();
        })

    } else {
        levelDiv.remove();
    }

    if (playerType == PLAYER_TYPE.Ghost) {
        carTypeList.remove();
        dropdown.remove();
        deleteBtn.remove() // TODO: re-enable; uncheck relevant LB entry

        if (!isHost) {
            colourBtn.remove();
            colourPicker.remove();
        }
    }
}

function prepareControls() {
    prepareControls_startRace(true);
    prepareControls_leaveLobby(true);
    prepareControls_lobbyOptions(true);
    prepareControls_addPlayer(true);
    prepareControls_addRobot(true);
    prepareControls_leaderboard(true);
}



// [[ Set Up ]] //

async function initialiseLobbyPage() {
    let track = await getTrack(lobby.getTrackId());
    let leaderboard = await getLeaderboard(track.getId());

    updatePageDescription();
    updateTrackDetails(track);
    updateLeaderboard(leaderboard);
    prepareControls();

    refreshLobbyDetails();

    GeneralUI.prepareTooltips();
}

async function startRace() {
    let lobbyId = lobby.getId();

    // update server data
    if (!isOnline) {
        await fetch(`/api/lobbies/${lobby.getId()}/offline`, {
            method: "PATCH",
            headers: new Headers({ "Content-Type": "application/json"}),
            body: JSON.stringify({ details: lobby })
        });
    }
    
    let startRes = await fetch(`/api/lobbies/start/${lobbyId}`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ lobbyId, playerId })
    });

    if (startRes.ok) {
        let result = await startRes.json();
        let raceId = result.raceId;

        window.location.href = `/races/${raceId}`;
    
    } else {
        GeneralUI.createToast("Failed to Start Race", startRes.statusText, "#A00");
    }
}


lobby = Lobby.toInstance( lobby_ );
isHost = playerId == lobby.getHostId();
isOnline = isOnline_;

initialiseLobbyPage(lobby);


// update connection
if (isOnline) {
    let lobbyRef = ref(db, `lobbies/${lobby.getId()}`);

    onValue(lobbyRef, (snapshot) => {
        let lobbyObj = snapshot.val() || null;

        if (!lobbyObj) {
            // redirect to race - if no race, will go back
            window.location.href = `/races/${lobby.getId()}`;
        }

        lobby = Lobby.toInstance(lobbyObj)

        refreshLobbyDetails();

        if (!lobby.getPlayers()[playerId]) {
            window.location.href = "/tracks";
        }
    });
}