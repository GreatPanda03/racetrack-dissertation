// manages the tracks list section

// * source 1: Game Development, "How can I find an optimum set of colors for 10 players?", Stack Exchange, stackexchange.com, [Online]. Available at: https://gamedev.stackexchange.com/questions/46463. Accessed: Mar. 1, 2026.
// * source 2: Stack Overflow, "How to convert HSB/HSV color to RGB accurately?", Stack Exchange, stackexchange.com, [Online]. Available at: https://stackoverflow.com/questions/17242144. Accessed: Mar. 1, 2026.
// * source 3: Prashant Yadav (2022), "Convert RGB to HEX color in JavaScript", LearnersBucket, learnersbucket.com, [Online]. Available at: https://learnersbucket.com/examples/interview/convert-rgb-to-hex-color-in-javascript/. Accessed: Mar. 1, 2026.


// [[ Imports ]] //
import {
    Track, TrackRenderer,
    Lobby,
    RACECAR_INFO, RACER_TYPE
} from "/core/index.js";



// [[ Variables ]] // 
var selectedTrack;
var spacing = 25;

var lobby;              // Lobby
var ghostData = [];     // Ghosts to include in race



// [[ Entry Creation ]] //

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


function createTrackEntry(track) {
    let entryTemplate = document.getElementById("track-list-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    let canvas = entry.querySelector(".entry-canvas");
    let title = entry.querySelector(".entry-title");

    title.innerHTML = track.getName();

    let renderer = new TrackRenderer(track, canvas, spacing);
    renderer.setVisibility("nodes", false);
    renderer.setVisibility("wires", false);
    renderer.setScale(canvas.width / 750);
    renderer.redrawTrack();

    return entry;
}


// [source 1, source 2, source 3]
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

function generateColour(number) {
    // generates a somewhat "distant" colour for the given
    //   racer number (based on the golden ratio) in HTML hex format

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



// [[ Track Searching ]] //

function initialiseTrackSearch() {
    let searchInput = document.getElementById("track-search-input");
    let searchSubmit = document.getElementById("track-search-submit");

    searchInput.addEventListener("keyup", (e) => applySearchQuery());
    searchSubmit.addEventListener("click", (e) => applySearchQuery());

    applySearchQuery();
}


function applySearchQuery() {
    let searchInput = document.getElementById("track-search-input");
    let searchCount = document.getElementById("track-search-count");
    let query = searchInput.value.toLowerCase();

    let entries = document.getElementById("track-lists")
        .getElementsByClassName("track-entry");

    let matches = 0;

    for (let entry of entries) {
        let nameLabel = entry.getElementsByClassName("entry-title")[0];
        let name = nameLabel.innerHTML.toLowerCase();

        if (name.includes(query)) {
            entry.hidden = false;
            matches += 1;
        } else {
            entry.hidden = true;
        }
    }

    searchCount.innerHTML = `Total Results: ${matches} / ${entries.length}`;
}



// [[ Track Details ]] //

function initialiseTrackDetails() {
    let playBtn = document.getElementById("details-play");
    let editBtn = document.getElementById("details-edit");
    let deleteBtn = document.getElementById("details-delete");

    function validateTrack(track) {
        if ( !(track instanceof Track) ) {
            throw new Error(`[Tracks List] "${track}" is not a valid Track`);
        }
    }

    playBtn.addEventListener("click", (e) => {
        validateTrack(selectedTrack);
        startLobby(selectedTrack);
    });

    editBtn.addEventListener("click", async (e) => {
        validateTrack(selectedTrack);
        window.location.href = `/tracks/build/${selectedTrack.getId()}`;
    });

    deleteBtn.addEventListener("click", (e) => {
        validateTrack(selectedTrack);
        window.location.href = `/tracks/delete/${selectedTrack.getId()}`;
    });
}


function showTrackDetails(track) {
    lobby = new Lobby();
    selectedTrack = track;

    refreshRacerDetails();

    let popup = document.getElementById("modal-track-details");
    let modal = new bootstrap.Modal(popup);
    modal.show();

    // track info
    let infoBody = document.getElementById("details-info");
    infoBody.innerHTML = `
        <div style="text-align: start">
            <div> <b>Name:</b> ${track.getName()} </div>
            <div> <b>Description:</b> ${track.getDescription()} </div>
            <div> <b>Author:</b> ${track.getAuthor()} </div>
        </div>
        <hr>
    `;

    // leaderboard info
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
                    ghostData.push(row);

                } else {
                    let index = ghostData.findIndex(g => g.name == name && g.carType == carType);
                    if (index) ghostData.splice(index, 1);
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

    let leaderboard = theLeaderboards.find(l => l._id == track.getId());

    let lbDiv = document.createElement("div");
    let lbContent = null;

    lbDiv.id = "leaderboard-div";
    lbDiv.innerHTML += "<div class='text-center'><b>Track Times</b></div>";

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

    lbDiv.appendChild(lbContent);
    infoBody.appendChild(lbDiv);

    // track preview
    let canvas = document.getElementById("details-canvas");

    let renderer = new TrackRenderer(track, canvas, spacing);
    renderer.setVisibility("nodes", false);
    renderer.setVisibility("wires", false);
    renderer.setScale(canvas.width / 750);
    renderer.redrawTrack();

    // TODO: when "players" are a thing, only allow
    //   editing / deleting for personal tracks

    let author = track.getAuthor();
    let modifiable = !(author != "" && author != "Game");
    document.getElementById("details-edit").hidden = modifiable;
    document.getElementById("details-delete").hidden = modifiable;
}


function addDefaultRacer(racerType) {
    let carType = Object.keys(RACECAR_INFO)[0];
    let colour = generateRacerColour(0);

    let racer = lobby.addRacer(racerType, carType, colour);
    racer.Level = 1;

    refreshRacerDetails();

    return racer;
}


function initialiseLobbyDetails() {
    let addPlayer = document.getElementById("player-racers-add");
    let addRobot = document.getElementById("robot-racers-add");
    let lobbyOptions = document.getElementById("lobby-options");

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
    let options = document.getElementById("options-racers");
    let oldTooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");
    
    let playerList = document.getElementById("player-racers-list");
    let robotList = document.getElementById("robot-racers-list");
            
    oldTooltips.forEach(tooltip => {
        bootstrap.Tooltip.getInstance(tooltip).dispose();
    });
    
    playerList.innerHTML = "";
    robotList.innerHTML = "";

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
        }
    }

    // update labels
    let playerLabel = document.getElementById("player-racers-label");
    let robotLabel = document.getElementById("robot-racers-label");

    playerLabel.innerHTML = `Players (${playerList.childElementCount})`;
    robotLabel.innerHTML = `Robots (${robotList.childElementCount})`;

    // widgets & icons
    lucide.createIcons();
    
    let tooltips = options.querySelectorAll("[data-bs-toggle='tooltip']");

    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip, { trigger: "hover" })
    });
}



// [[ Track Selection ]] //

function loadAllTracks(tracks) {
    let gameTracks = document.getElementById("game-tracks-list");
    let playerTracks = document.getElementById("player-tracks-list");
    let personalTracks = document.getElementById("personal-tracks-list");

    function createEntryForList(list, track) {
        let entry = createTrackEntry(track);
        let frame = entry.querySelector(".track-entry");
        frame.addEventListener("click", (e) => {
            showTrackDetails(track);
        });
        list.appendChild(entry);

        return entry;
    }

    for (let track of tracks) {
        if (track.getAuthor() == "Game") {
            createEntryForList(gameTracks, track);

        } else {
            createEntryForList(playerTracks, track);
            createEntryForList(personalTracks, track);
        }
    }
}


function startLobby(track) {
    if (!track) {
        throw new Error(`[Tracks List] No track provided to play`);
    }

    if (lobby.getRacers().length == 0) { // solo race
        addDefaultRacer(RACER_TYPE.Player);
    }    

    /* NOTE: use this when using an actual lobby system 
    (async () => {
        await fetch("/tracks/play", {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json"}),
            body: JSON.stringify({ trackId: track.getId(), racers })
        });
    })();
    */

    for (let data of ghostData) {
        let ghost = addDefaultRacer(RACER_TYPE.Ghost);
        ghost.Colour = "#777";
        ghost.Moves = data.moves
        ghost.CarType = data.carType || Object.keys(RACECAR_INFO)[0];
    }

    let trackId = track.getId();
    let lobbyJson = JSON.stringify(lobby);
    let lobbyEncoded = encodeURIComponent(lobbyJson);

    window.location.href = `/tracks/play/${trackId}?lobby=${lobbyEncoded}`;   
}



// [[ Set Up ]] //

// through ejs

let theTracks = tracks.map(t => Track.toInstance(JSON.parse(t)));
let theLeaderboards = leaderboards.map(l => JSON.parse(l));

loadAllTracks(theTracks);

initialiseTrackSearch();

initialiseTrackDetails();

initialiseLobbyDetails();

lucide.createIcons();


// enables all tooltips on the page
// * source: https://getbootstrap.com/docs/5.3/components/tooltips/
let tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");

tooltipTriggerList.forEach(tooltip => {
    new bootstrap.Tooltip(tooltip, { trigger: "hover" })
});