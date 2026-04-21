// manages offline lobbies on the client


// [[ Variables ]] //

import {
    Track,
    Lobby, Player,
    PLAYER_TYPE, RACECAR_INFO
} from "/core/index.js";

import GeneralUI from "./utilities/general-ui.js";

import { initAuth } from "./firebase.js";

lucide.createIcons();



// [[ Variables ]] //

var user = await initAuth();
var playerId = user.uid;



// [[ Lobby Options ]] //

function initialiseLobbyDetails() {
    let pageDescription = document.getElementById("page-description");

    let startBtn = document.getElementById("start-race");
    let leaveBtn = document.getElementById("leave-lobby");
    let addPlayer = document.getElementById("player-racers-add");
    let addRobot = document.getElementById("robot-racers-add");
    let lobbyOptions = document.getElementById("lobby-options");

    // description
    let hostDescription = ""
    if (lobby.getHostId() == playerId) {
        hostDescription = "<p><b>You're the lobby host!</b> You can set the settings for the lobby below. You can start the game whenever you're ready.</p>";
    }

    pageDescription.innerHTML = `<p>You're in a lobby to play an <b>offline</b> game.</p> ${hostDescription}`;

    // lobby options
    startBtn.addEventListener("click", (e) => {
        startRace();
    });

    leaveBtn.addEventListener("click", async (e) => {
        await leaveLobby(lobby, playerId);
    });

    addPlayer.addEventListener("click", (e) => {
        addDefaultRacer(PLAYER_TYPE.Player);
        refreshRacerDetails();
    });

    addRobot.addEventListener("click", (e) => {
        addDefaultRacer(PLAYER_TYPE.Robot);
        refreshRacerDetails();
    });

    for (let element of lobbyOptions.children) {
        let input = element.querySelector("input[type=checkbox");

        input.addEventListener("change", (e) => {
            let option = input.dataset.option;
            let value = input.checked;

            lobby.setOption(option, value);
        });
    }
}


function refreshRacerDetails() {
    let options = document.getElementById("race-options");
    let oldTooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");

    let playerList = document.getElementById("player-racers-list");
    let robotList = document.getElementById("robot-racers-list");
    let ghostList = document.getElementById("ghost-racers-list");        

    oldTooltips.forEach(tooltip => {
        bootstrap.Tooltip.getInstance(tooltip)?.dispose();
    });
    
    playerList.innerHTML = "";
    robotList.innerHTML = "";
    ghostList.innerHTML = "";

    let racerInfo = Object.keys(PLAYER_TYPE).map(k => {
        return ({Count: 0, Name: k})
    });
    racerInfo.unshift(undefined); // hacky: to accommodate 1-n enum numbering

    let racers = Object.values(lobby.getPlayers());
    racers.sort((a, b) => a.getId() > b.getId());

    for (let racer of racers) {
        let id = racer.getId();
        let racerType = racer.getPlayerType();
        let carType = lobby.getPlayerDetail(id, "carType")

        let info = racerInfo[racerType];
        info.Count += 1;

        let entry = createRacerEntry(racer);

        // naming
        let name = `<b>${info.Name} ${info.Count}</b> - ${carType}`;
        let nameElement = entry.querySelector(".racer-details");
        nameElement.innerHTML = name;

        // colouring
        let colourBtn = entry.querySelector(".btn-racer-colour");
        let colourPicker = colourBtn.querySelector("input");

        colourBtn.addEventListener("click", (e) => {
            let colourPicker = colourBtn.querySelector("input");
            colourPicker.focus();
        });

        colourPicker.addEventListener("change", (e) => {
            let newColour = colourPicker.value;
            lobby.setPlayerDetail(id, "colour", newColour);
            refreshRacerDetails();
        });

        // car types
        let carTypeList = entry.querySelector(".div-racer-cartype");
        let dropdown = carTypeList.querySelector(".dropdown-menu");

        for (let item of dropdown.children) {
            item.addEventListener("click", (e) => {
                let newCarType = item.querySelector(".car-type-name").innerHTML;
                lobby.setPlayerDetail(id, "carType", newCarType);
                refreshRacerDetails();
            });
        }

        if (racerType == PLAYER_TYPE.Robot) {
            let levelInput = entry.querySelector(".input-robot-level");
            levelInput.value = lobby.getPlayerDetail(id, "level");
            
            levelInput.addEventListener("change", (e) => {
                let newLevel = levelInput.value;
                newLevel = Math.min(Math.max(level, 0), 4);
                lobby.setPlayerDetail(id, "level", newLevel);
                refreshRacerDetails();
            })

        } else {
            let levelDiv = entry.querySelector(".div-robot-level");
            levelDiv.remove();

            if (racerType == PLAYER_TYPE.Ghost) {
                carTypeList.remove();
                dropdown.remove();
            }
        }

        // deletion
        let deleteBtn = entry.querySelector(".btn-racer-remove");

        if (id == lobby.getHostId()) {
            deleteBtn.remove();

        } else {
            deleteBtn.addEventListener("click", (e) => {
                lobby.removePlayer(racer);
                refreshRacerDetails();
            });
        }

        if (racerType == PLAYER_TYPE.Player) {
            playerList.appendChild(entry);
        
        } else if (racerType == PLAYER_TYPE.Robot) {
            robotList.appendChild(entry);
        
        } else if (racerType == PLAYER_TYPE.Ghost) {
            ghostList.appendChild(entry);
        }
    }

    // update labels
    let playerLabel = document.getElementById("player-racers-label");
    let robotLabel = document.getElementById("robot-racers-label");
    let ghostLabel = document.getElementById("ghost-racers-label");

    let playerCount = playerList.childElementCount;
    let robotCount = robotList.childElementCount;
    let ghostCount = ghostList.childElementCount;

    playerLabel.innerHTML = `Player Racers (${playerCount})`;
    robotLabel.innerHTML = `Robot Racers (${robotCount})`;
    ghostLabel.innerHTML = `Ghost Racers (${ghostCount})`;

    // widgets & icons
    lucide.createIcons();
    
    GeneralUI.prepareTooltips();
}


function addDefaultRacer(playerType) {
    let carType = Object.keys(RACECAR_INFO)[0];

    let details = lobby.getPlayerDetails();
    let colours = Object.values(details).map(d => d.colour);
    let colour = GeneralUI.generateUniqueColourFromNumber(colours, 0);

    let prefix = Object.keys(PLAYER_TYPE).find(k => PLAYER_TYPE[k] == playerType);
    let targets = Object.values(lobby.getPlayers());
    let id = 0;

    do {
        let exists = targets.find(t => t.getId() == id.toString());
        if (exists != undefined) id += 1; else break;
    } while (true)
    
    let player = new Player(id.toString(), "", playerType);
    let racer = lobby.addPlayer(player);

    id = player.getId();
    lobby.setPlayerDetail(id, "carType", "The Race Car");
    lobby.setPlayerDetail(id, "colour", colour);

    if (playerType == PLAYER_TYPE.Robot) {
        lobby.setPlayerDetail(id, "level", 1);
    }

    return racer;
}



// [[ Entry Creation ]] //

function createRacerEntry(racer) {
    let entryTemplate = document.getElementById("racer-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    // colour
    let colour = lobby.getPlayerDetail(racer.getId(), "colour");

    let colourMarker = entry.querySelector(".racer-colour");
    let colourBtn = entry.querySelector(".btn-racer-colour");
    let colourPicker = colourBtn.querySelector("input");

    colourMarker.setAttribute("fill", colour);
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



// [[ Leaderboard Creation ]] //

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

        let ghostBox = document.createElement("td");
        ghostBox.innerHTML = `<label style="display: inline-block; width: 100%; height: 100%;">
            <input class="form-check-input mt-1" type="checkbox" id="ghost-${rank}"}>
        </label>`;

        let inputBox = ghostBox.querySelector(".form-check-input");
        let addedGhost = null;

        inputBox.addEventListener("change", (e) => {
            if (inputBox.checked) {
                addedGhost = addDefaultRacer(PLAYER_TYPE.Ghost);

                let id = addedGhost.getId();
                lobby.setPlayerDetail(id, "colour", "#777");
                lobby.setPlayerDetail(id, "carType", row.carType)

                refreshRacerDetails();

            } else {
                if (addedGhost) {
                    lobby.removePlayer(addedGhost)
                    refreshRacerDetails();
                }
            }
        });

        tr.appendChild(ghostBox); // add ghost to race
        
        tbody.appendChild(tr);
        rank += 1;
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}



// [[ Lobby Details ]] //

async function loadLobbyInfo(lobby) {
    let lobbyId = lobby.getId();
    let trackId = lobby.getTrackId();

    let lbJson = await fetch(`/api/leaderboards/${trackId}`).then(r => r.json());
    let leaderboard = lbJson.leaderboard;

    let trackJson = await fetch(`/api/tracks/${trackId}`).then(r => r.json());
    let track = Track.toInstance(trackJson.track);

    // track info
    let infoBody = document.getElementById("details-info");
    infoBody.innerHTML = `
        <div style="text-align: start">
            <div> <b>Name:</b> ${track.getName()} </div>
            <div> <b>Description:</b> ${track.getDescription()} </div>
            <div> <b>Author:</b> ${track.getAuthor()} </div>
        </div>`;

    // leaderboard info
    let lbBody = document.getElementById("details-leaderboard");
    lbBody.innerHTML += "<div class='text-center'><b>Track Times</b></div>";

    let lbContent = null;

    if (leaderboard && Object.keys(leaderboard.scores).length > 0) {

        // flattens all entries and sorts them purely by time
        let sortedScores = Object.entries(leaderboard.scores)
            .flatMap(([player, cars]) =>
                Object.entries(cars).map(([carType, score]) => ({
                    player, carType, ...score
                }))
            )
            .sort((a, b) => a.time - b.time);

        lbContent = constructLeaderboard(sortedScores);

    } else {
        lbContent = document.createElement("span");
        lbContent.innerHTML = "This track has no records - be the first to set one!";
    }

    lbBody.appendChild(lbContent);

    // track preview
    let canvas = document.getElementById("details-canvas");

    GeneralUI.generateTrackPreview(canvas, track, 25);
}



// [[ Race Commencement ]] //

async function startRace() {
    let lobbyId = lobby.getId();

    // update server data
    await fetch(`/api/lobbies/${lobby.getId()}/offline`, {
        method: "PATCH",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ details: lobby })
    });

    let startRes = await fetch(`/api/lobbies/start/${lobbyId}`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ lobbyId, playerId })
    });

    if (startRes.ok) {
        let result = await startRes.json();
        let raceId = result.raceId;

        window.location.href = `/race/${raceId}`;
    
    } else {
        GeneralUI.createToast("Failed to Start Race", startRes.statusText, "#A00");
    }
}



// [[ Set Up ]] //

let lobby = Lobby.toInstance(lobby_);

loadLobbyInfo(lobby);

initialiseLobbyDetails();

refreshRacerDetails();

GeneralUI.prepareTooltips();