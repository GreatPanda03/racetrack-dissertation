// manages the tracks list section

// * source 1: Game Development, "How can I find an optimum set of colors for 10 players?", Stack Exchange, stackexchange.com, [Online]. Available at: https://gamedev.stackexchange.com/questions/46463. Accessed: Mar. 1, 2026.
// * source 2: Stack Overflow, "How to convert HSB/HSV color to RGB accurately?", Stack Exchange, stackexchange.com, [Online]. Available at: https://stackoverflow.com/questions/17242144. Accessed: Mar. 1, 2026.
// * source 3: Prashant Yadav (2022), "Convert RGB to HEX color in JavaScript", LearnersBucket, learnersbucket.com, [Online]. Available at: https://learnersbucket.com/examples/interview/convert-rgb-to-hex-color-in-javascript/. Accessed: Mar. 1, 2026.


// [[ Imports ]] //
import {
    Track, TrackRenderer,
    RACECAR_INFO, RACER_TYPE
} from "/core/index.js";



// [[ Variables ]] // 
var selectedTrack;
var spacing = 25;

var racers = [];



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

function generateRacerColour(number) {
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
    racers = [];
    selectedTrack = track;

    refreshRacerDetails();

    let popup = document.getElementById("modal-track-details");
    let modal = new bootstrap.Modal(popup);
    modal.show();

    let infoBody = document.getElementById("details-info");
    infoBody.innerHTML = `
        <div style="text-align: start">
            <div> <b>Name:</b> ${track.getName()} </div>
            <div> <b>Description:</b> ${track.getDescription()} </div>
            <div> <b>Author:</b> ${track.getAuthor()} </div>
        </div>
    `;

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


function initialiseRacerDetails() {
    let addPlayer = document.getElementById("player-racers-add");
    let addRobot = document.getElementById("robot-racers-add");

    addPlayer.addEventListener("click", (e) => {
        let racer = {
            RacerType: RACER_TYPE.Player,
            CarType: Object.keys(RACECAR_INFO)[0],
            Colour: generateRacerColour(racers.length)};

        racers.push(racer);

        refreshRacerDetails();
    });

    addRobot.addEventListener("click", (e) => {
        let racer = {
            RacerType: RACER_TYPE.Robot,
            CarType: Object.keys(RACECAR_INFO)[0],
            Colour: generateRacerColour(racers.length)};

        racers.push(racer);

        refreshRacerDetails();
    });
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

    let playerCount = 0;
    let robotCount = 0;

    for (let racer of racers) {
        let name = "";
        let carType = racer.CarType;

        if (racer.RacerType == RACER_TYPE.Player) {
            playerCount += 1;
            name = `<b>Player ${playerCount}</b> - ${carType}`;

        } else if (racer.RacerType == RACER_TYPE.Robot) {
            robotCount += 1;
            name = `<b>Robot ${robotCount}</b> - ${carType}`;
        }

        let entry = createRacerEntry(racer);

        // naming
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

        // deletion
        let deleteBtn = entry.querySelector(".btn-racer-remove");

        deleteBtn.addEventListener("click", (e) => {
            let index = racers.findIndex(r => r == racer);
            console.log(index);
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

    playerLabel.innerHTML = `Players (${playerCount})`;
    robotLabel.innerHTML = `Robots (${robotCount})`;

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

    tracks = tracks.map(t => Track.toInstance(JSON.parse(t)));

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

    if (racers.length == 0) { // solo race
        racers.push({
            RacerType: RACER_TYPE.Player,
            CarType: Object.keys(RACECAR_INFO)[0],
            Colour: generateRacerColour(0)
        });
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

    let trackId = track.getId();
    let racersJson = JSON.stringify(racers);
    let racersEncoded = encodeURIComponent(racersJson);

    window.location.href = `/tracks/play/${trackId}?racers=${racersEncoded}`;   
}



// [[ Set Up ]] //

loadAllTracks(tracks); // provided through Node

initialiseTrackSearch();

initialiseTrackDetails();

initialiseRacerDetails();

lucide.createIcons();


// enables all tooltips on the page
// * source: https://getbootstrap.com/docs/5.3/components/tooltips/
let tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");

tooltipTriggerList.forEach(tooltip => {
    new bootstrap.Tooltip(tooltip, { trigger: "hover" })
});