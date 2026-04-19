// manages offline lobbies on the client


// [[ Variables ]] //

import {
    Track,
    TrackRenderer,
    Lobby,
    RACER_TYPE, RACECAR_INFO, LOBBY_LOCALITY
} from "/core/index.js";

import { initAuth } from "./firebase.js";



// [[ Variables ]] //

var user = await initAuth();
var playerId = user.uid;



// [[ Lobby Options ]] //

function initialiseLobbyOptions() {
    let startBtn = document.getElementById("start-race");
    let addPlayer = document.getElementById("player-racers-add");
    let addRobot = document.getElementById("robot-racers-add");
    let lobbyOptions = document.getElementById("lobby-options");

    startBtn.addEventListener("click", (e) => {
        startRace();
    });

    addPlayer.addEventListener("click", (e) => {
        addDefaultRacer(RACER_TYPE.Player);
    });

    addRobot.addEventListener("click", (e) => {
        addDefaultRacer(RACER_TYPE.Robot);
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
    updateLobbyOnServer();

    let options = document.getElementById("lobby-options");
    let oldTooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");
    
    let playerList = document.getElementById("player-racers-list");
    let robotList = document.getElementById("robot-racers-list");
    let ghostList = document.getElementById("ghost-racers-list");        

    oldTooltips.forEach(tooltip => {
        bootstrap.Tooltip.getInstance(tooltip).dispose();
    });
    
    playerList.innerHTML = "";
    robotList.innerHTML = "";
    ghostList.innerHTML = "";

    let racerInfo = Object.keys(RACER_TYPE).map(k => {
        return ({Count: 0, Name: k})
    });
    racerInfo.unshift(undefined); // hacky: to accommodate 1-n enum numbering

    let racers = lobby.getRacers();

    for (let racer of racers) {
        let racerType = racer.RacerType;
        let carType = racer.CarType;

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
            racer.Colour = colourPicker.value;
            refreshRacerDetails();
        });

        // car types
        let carTypeList = entry.querySelector(".div-racer-cartype");
        let dropdown = carTypeList.querySelector(".dropdown-menu");

        for (let item of dropdown.children) {
            item.addEventListener("click", (e) => {
                racer.CarType = item.querySelector(".car-type-name").innerHTML;
                refreshRacerDetails();
            });
        }

        if (racerType == RACER_TYPE.Robot) {
            let levelInput = entry.querySelector(".input-robot-level");
            levelInput.value = racer.Level;
            
            levelInput.addEventListener("change", (e) => {
                let level = levelInput.value;
                level = Math.min(Math.max(level, 0), 4);
                racer.Level = level;

                refreshRacerDetails();
            })

        } else {
            let levelDiv = entry.querySelector(".div-robot-level");
            levelDiv.remove();

            if (racerType == RACER_TYPE.Ghost) {
                carTypeList.remove();
                dropdown.remove();
            }
        }

        // deletion
        let deleteBtn = entry.querySelector(".btn-racer-remove");

        deleteBtn.addEventListener("click", (e) => {
            let index = racers.findIndex(r => r == racer);
            racers.splice(index, 1);
            refreshRacerDetails();
        });

        if (racer.RacerType == RACER_TYPE.Player) {
            playerList.appendChild(entry);
        
        } else if (racer.RacerType == RACER_TYPE.Robot) {
            robotList.appendChild(entry);
        
        } else if (racer.RacerType == RACER_TYPE.Ghost) {
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
    
    let tooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");

    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip, { trigger: "hover" })
    });
}


function addDefaultRacer(racerType) {
    let carType = Object.keys(RACECAR_INFO)[0];
    let colour = generateRacerColour(0);

    let racer = lobby.addRacer(racerType, carType, colour);

    if (racerType == RACER_TYPE.Robot) {
        racer.Level = 1;
    }

    refreshRacerDetails();

    return racer;
}


async function updateLobbyOnServer() {
    let lobbyId = lobby.getId();

    let response = await fetch(`/lobbies/${lobbyId}`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ details: lobby })
    });

    if (!response.ok) {
        console.log("Could not update lobby details");
    }
}



// [[ Entry Creation ]] //

// [source 1, source 2, source 3]
function generateColour(number) {
    // generates a somewhat "distant" colour for the given
    //   racer number (based on the golden ratio) in HTML hex format

    const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

    // source 1
    let h = (number * GOLDEN_RATIO) % 1;
    let s = 0.75;
    let v = Math.sqrt(1 - ((number * GOLDEN_RATIO) % 0.5));

    // source 2
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    // source 3
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hex;
}


function generateRacerColour(number) { // starting number
    let racers = lobby.getRacers();
    let colours = racers.map(r => r.Colour);
    let colour;

    do {
        colour = generateColour(number);
        number += 1;
    } while (colours.find(c => c == colour))

    return colour;
}


function createRacerEntry(racer) {
    let entryTemplate = document.getElementById("racer-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    // colour
    let colour = racer.Colour;

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

        inputBox.addEventListener("change", (e) => {
            if (inputBox.checked) {
                let ghost = lobby.addRacer(RACER_TYPE.Ghost, 
                    row.carType,
                    "#777")
                ghost.Name = row.name;
                ghost.Moves = row.moves;

                refreshRacerDetails();

            } else {
                let racers = lobby.getRacers();
                let index = racers.findIndex(r => r.name == name);
                
                if (index) {
                    racers.splice(index, 1);
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
    
    let lbRes = await fetch(`/tracks/leaderboards/${lobby.getTrackId()}`);
    let leaderboard = null

    if (lbRes.ok) {
        let lbJson = await lbRes.json();
        leaderboard = JSON.parse(lbJson.leaderboard);
    }

    let trackRes = await fetch(`/tracks/${lobby.getTrackId()}`);
    let track = null;

    if (trackRes.ok) {
        let trackJson = await trackRes.json();
        track = Track.toInstance(trackJson.track);
    }

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

    let renderer = new TrackRenderer(track, canvas, 25);
    renderer.setVisibility("nodes", false);
    renderer.setVisibility("wires", false);
    renderer.setScale(canvas.width / 750);
    renderer.redrawTrack();
}



// [[ Race Commencement ]] //

async function startRace() {
    let lobbyId = lobby.getId();

    let startRes = await fetch(`/lobby/start`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ lobbyId, playerId })
    });

    if (startRes.ok) {
        let result = await startRes.json();
        let raceId = result.raceId;

        window.location.href = `/tracks/play/${raceId}`;
    }
}



// [[ Set Up ]] //

let lobby = new Lobby();
lobby.setId(lobby_.id);
lobby.setTrackId(lobby_.trackId);
lobby.setLocality(LOBBY_LOCALITY.Offline);

loadLobbyInfo(lobby);

initialiseLobbyOptions();

lucide.createIcons();