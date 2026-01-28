// manages the tracks list section


// [[ Imports ]] //
import {
    Track, TrackRenderer,
    RACECAR_INFO
} from "/core/index.js";



// [[ Variables ]] // 
var selectedTrack;



// [[ Functions ]] //

// prepares the track search bar
function initialiseTrackSearch() {
    let searchInput = document.getElementById("track-search-input");
    let searchSubmit = document.getElementById("track-search-submit");

    searchInput.addEventListener("keyup", (e) => applySearchQuery());
    searchSubmit.addEventListener("click", (e) => applySearchQuery());

    applySearchQuery();
}


// applies the current search query to the list of tracks
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


// prepares the track details modal
function initialiseTrackDetails() {
    let racecarInput = document.getElementById("details-racecar-input");
    let playBtn = document.getElementById("details-play");
    let editBtn = document.getElementById("details-edit");
    let deleteBtn = document.getElementById("details-delete");

    function validateTrack(track) {
        if ( !(track instanceof Track) ) {
            throw new Error(`[Tracks List] "${track}" is not a valid Track`);
        }
    }

    racecarInput.addEventListener("change", (e) => updateRaceCarDetails());

    playBtn.addEventListener("click", (e) => {
        validateTrack(selectedTrack);
        loadTrack(selectedTrack);
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


// loads all race car types into the track details selection box
function loadAllRaceCarTypes() {
    let racecarInput = document.getElementById("details-racecar-input");

    racecarInput.innerHTML = "";

    for (let racecar of RACECAR_INFO) {
        let option = document.createElement("option");
        option.value = racecar.Id;
        option.innerHTML = racecar.Name;
        racecarInput.appendChild(option);
    }

    racecarInput.selectedIndex = 0;
    updateRaceCarDetails();
}


// loads all available tracks for the game
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


// creates a track entry from the given track
function createTrackEntry(track) {
    let entryTemplate = document.getElementById("track-list-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    let canvas = entry.querySelector(".entry-canvas");
    let title = entry.querySelector(".entry-title");

    title.innerHTML = track.getName();

    let renderer = new TrackRenderer(track, canvas);
    renderer.setVisibility("nodes", false);
    renderer.setVisibility("wires", false);
    renderer.setScale(canvas.width / 750);
    renderer.redrawTrack();

    return entry;
}


// shows the track details modal with the given details
function showTrackDetails(track) {
    selectedTrack = track;

    let popup = document.getElementById("modal-track-details");
    let modal = new bootstrap.Modal(popup);
    modal.show();

    let infoBody = document.getElementById("details-info");
    infoBody.innerHTML = `
        <div> <b>Name:</b> ${track.getName()} </div>
        <div> <b>Description:</b> ${track.getDescription()} </div>
        <div> <b>Author:</b> ${track.getAuthor()} </div>
    `;

    let canvas = document.getElementById("details-canvas");

    let renderer = new TrackRenderer(track, canvas);
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


// updates the track details to show the current race car's details
function updateRaceCarDetails() {
    let racecarInput = document.getElementById("details-racecar-input");
    let id = racecarInput.value;

    let racecar = RACECAR_INFO.find((r) => r.Id == id);

    let detailsBody = document.getElementById("details-racecar-info");

    detailsBody.innerHTML = `
        <span> ${racecar.Description} </span>
        <span> <b>Max X/Y Speed:</b> ${racecar.MaxSpeed.x()} / ${racecar.MaxSpeed.y()} m/s </span>
        <span> <b>Max X/Y Accel.:</b> ${racecar.MaxAcceleration.x()} / ${racecar.MaxAcceleration.y()} m/s² </span>
    `;
}


// loads the given track via the gameplay script
function loadTrack(track) {

    // TODO: make this a POST request (since it's now becoming
    //   more of a submission than a retrieval)

    let trackId = track.getId();
    let racecarId = document.getElementById("details-racecar-input").value;

    let racecar = RACECAR_INFO.find(r => r.Id == racecarId);
    if (!racecar) {
        throw new Error(`[Gameplay] "${id}" is not a recognised race car ID`);
    }

    window.location.href = `/tracks/play/${trackId}/${racecarId}`;
}



// [[ Set Up ]] //

loadAllTracks(tracks); // provided through Node

loadAllRaceCarTypes();

initialiseTrackSearch();

initialiseTrackDetails();

lucide.createIcons();