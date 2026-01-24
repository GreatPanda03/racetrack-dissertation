// manages the tracks list section


// [[ Imports ]] //
import {
    Track, TrackRenderer
} from "/core/index.js";



// [[ Variables ]] // 
let selectedTrack;



// [[ Functions ]] //

// prepares the track details modal
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

    document.getElementById("details-name").innerHTML          = `<b>Name:</b> ${track.getName()}`;
    document.getElementById("details-description").innerHTML   = `<b>Description:</b> ${track.getDescription()}`;
    document.getElementById("details-author").innerHTML        = `<b>Author:</b> ${track.getAuthor()}`;

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


// loads the given track via the gameplay script
function loadTrack(track) {
    window.location.href = window.location.origin 
        + `/tracks/play/${track.getId()}`;
}



// [[ Set Up ]] //

initialiseTrackDetails();

loadAllTracks(tracks); // provided through Node

lucide.createIcons();