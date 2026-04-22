// manages game lobbies on the client


// [[ Imports ]] //
import {
    Track,
    Player, Lobby,
    PLAYER_TYPE, RACECAR_INFO
} from "/core/index.js";

import GeneralUI from "./utilities/general-ui.js";

import { db, initAuth } from "./firebase.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

lucide.createIcons();



// [[ Variables ]] //
var user = await initAuth();
var playerId = user.uid;



// [[ Functions ]] //

function listenToLobby(lobby) {
    let lobbyId = lobby.getId();
    let lobbyRef = ref(db, `lobbies/${lobbyId}`);

    onValue(lobbyRef, (snapshot) => {
        let data = snapshot.val();

        if (!data) {
            console.log("Lobby has been deleted");
            window.location.href = "/tracks";
            return;
        }

        console.log("Live Update:", data);

        let updated = Lobby.toInstance({id: data.id, ...data});
        refreshRacerDetails(updated);
    });
}


async function sendLobbyUpdate(playerId) {
    await fetch(`/api/lobbies/${lobby.getId()}/online`, {
        method: "PATCH",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ details: lobby })
    });
}


async function leaveLobby(lobby, playerId) {
    let lobbyId = lobby.getId();
    let hostId = lobby.getHostId();

    if (playerId == hostId) {
        let lobbyRef = ref(db, `lobbies/${lobbyId}`);
        await remove(lobbyRef);
        window.location.href = "/lobbies";

    } else {
        let playerRef = ref(db, `lobbies/${lobbyId}/players/${playerId}`);
        await remove(playerRef);
        window.location.href = "/lobbies";
    }
}


function initialiseLobbyDetails() {
    let pageDescription = document.getElementById("page-description");

    let startBtn = document.getElementById("start-race");
    let leaveBtn = document.getElementById("leave-lobby");
    let addRobot = document.getElementById("robot-racers-add");
    let lobbyOptions = document.getElementById("lobby-options");

    // description
    let hostDescription = ""
    if (lobby.getHostId() == playerId) {
        hostDescription = "<p><b>You're the lobby host!</b> You can set the settings for the lobby below. You can start the game whenever you're ready.</p>";
    }

    pageDescription.innerHTML = `<p>You're in a lobby to play an <b>online</b> game.</p> ${hostDescription}`;

    // lobby options
    startBtn.addEventListener("click", (e) => {
        startRace();
    });

    leaveBtn.addEventListener("click", async (e) => {
        await leaveLobby(lobby, playerId);
    });

    addRobot.addEventListener("click", (e) => {
        addDefaultRacer(PLAYER_TYPE.Robot);
        sendLobbyUpdate();
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
    let options = document.getElementById("lobby-options");
    let oldTooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");
    
    let playerList = document.getElementById("player-racers-list");
    let robotList = document.getElementById("robot-racers-list");
            
    oldTooltips.forEach(tooltip => {
        bootstrap.Tooltip.getInstance(tooltip)?.dispose();
    });
    
    playerList.innerHTML = "";
    robotList.innerHTML = "";

    let racerInfo = Object.keys(PLAYER_TYPE).map(k => {
        return ({Count: 0, Name: k})
    });
    racerInfo.unshift(undefined); // hacky: to accommodate 1-n enum numbering

    let racers = lobby.getPlayers();

    for (let [id, racer] of Object.entries(racers)) {
        let racerType = racer.getPlayerType();
        let carType = lobby.getPlayerDetail(id, "carType");

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
            let colour = colourPicker.value;
            lobby.setPlayerDetail(playerId, "colour", colour);
            sendLobbyUpdate(playerId);
        });

        // car types
        let carTypeList = entry.querySelector(".div-racer-cartype");
        let dropdown = carTypeList.querySelector(".dropdown-menu");

        for (let item of dropdown.children) {
            item.addEventListener("click", (e) => {
                let carType = item.querySelector(".car-type-name").innerHTML;
                lobby.setPlayerDetail(playerId, "carType", carType);
                sendLobbyUpdate(playerId);
            });
        }

        if (racerType == PLAYER_TYPE.Robot) {
            let levelInput = entry.querySelector(".input-robot-level");
            levelInput.value = racer.Level;
            
            levelInput.addEventListener("change", (e) => {
                let level = levelInput.value;
                level = Math.min(Math.max(level, 0), 4);
                racer.Level = level;

                sendLobbyUpdate(playerId);
            })

        } else {
            let levelDiv = entry.querySelector(".div-robot-level");
            levelDiv.remove();
        }

        // deletion
        let deleteBtn = entry.querySelector(".btn-racer-remove");

        deleteBtn.addEventListener("click", (e) => {
            let index = racers.findIndex(r => r == racer);
            racers.splice(index, 1);
            sendLobbyUpdate(playerId);
        });

        if (racerType == PLAYER_TYPE.Player) {
            playerList.appendChild(entry);
        
        } else if (racerType == PLAYER_TYPE.Robot) {
            robotList.appendChild(entry);
        }
    }

    // update labels
    let playerLabel = document.getElementById("player-racers-label");
    let robotLabel = document.getElementById("robot-racers-label");

    playerLabel.innerHTML = `Player Racers (${playerList.childElementCount})`;
    robotLabel.innerHTML = `Robot Racers (${robotList.childElementCount})`;

    lucide.createIcons();
    GeneralUI.prepareTooltips();
}


function addDefaultRacer(playerType) {
    let carType = Object.keys(RACECAR_INFO)[0];

    let details = lobby.getPlayerDetails();
    let colours = Object.values(details).map(d => d.colour);
    let colour = GeneralUI.generateUniqueColourFromNumber(colours, 0);

    let prefix = Object.keys(PLAYER_TYPE).find(k => PLAYER_TYPE[k] == playerType);
    let player = new Player("Player 1", "", playerType);

    let racer = lobby.addPlayer(player);
    lobby.setPlayerDetail(player.getId(), "carType", "The Race Car");
    lobby.setPlayerDetail(player.getId(), "colour", colour);

    if (playerType == PLAYER_TYPE.Robot) {
        racer.Level = 1;
    }

    return racer;
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

        inputBox.addEventListener("change", (e) => {
            if (inputBox.checked) {
                let ghost = lobby.addRacer(PLAYER_TYPE.Ghost, 
                    row.carType,
                    "#777")
                ghost.Name = row.name;
                ghost.Moves = row.moves;

                sendLobbyUpdate(playerId);

            } else {
                let racers = lobby.getRacers();
                let index = racers.findIndex(r => r.name == name);
                
                if (index) {
                    racers.splice(index, 1);
                    sendLobbyUpdate(playerId);
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
    lbBody.innerHTML = "<div class='text-center'><b>Track Times</b></div>";

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



// [[ Set Up ]] //

let lobby = Lobby.toInstance(lobby_); // NOTE: has players
let lobbyId = lobby.getId();

if (!lobby_.players[playerId]) { // must be officially registered
    window.location.href = "/lobbies";
}

loadLobbyInfo(lobby);

initialiseLobbyDetails(lobby);

listenToLobby(lobby);

GeneralUI.prepareTooltips();