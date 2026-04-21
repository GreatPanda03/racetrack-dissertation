// manages the tracks list section


// [[ Imports ]] //
import {
    Track,
    Lobby,
    RACECAR_INFO, PLAYER_TYPE,
    Validator
} from "/core/index.js";

import GeneralUI from "./utilities/general-ui.js";

import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { initAuth } from "./firebase.js";

lucide.createIcons();


// [[ Variables ]] //
var user = await initAuth();
var playerId = user.uid;

var spacing = 25;
var selectedTrack = null;



// [[ Entry Creation ]] //

function createTrackEntry(track) {
    let entryTemplate = document.getElementById("track-list-entry-template");
    let entry = document.importNode(entryTemplate.content, true);

    let canvas = entry.querySelector(".entry-canvas");
    let title = entry.querySelector(".entry-title");

    title.innerHTML = track.getName();

    GeneralUI.generateTrackPreview(canvas, track, 25);

    return entry;
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
    let playOfflineBtn = document.getElementById("details-play-offline");
    let playOnlineBtn = document.getElementById("details-play-online");
    let editBtn = document.getElementById("details-edit");
    let deleteBtn = document.getElementById("details-delete");

    playOfflineBtn.addEventListener("click", (e) => {
        startLobby(selectedTrack, "offline");
    });

    playOnlineBtn.addEventListener("click", (e) => {
        startLobby(selectedTrack, "online");
    });

    editBtn.addEventListener("click", async (e) => {
        let id = selectedTrack.getTrackId()
        window.location.href = `/tracks/build/${id}`;
    });

    deleteBtn.addEventListener("click", (e) => {
        let id = selectedTrack.getTrackId();
        window.location.href = `/tracks/delete/${id}`;
    });
}


function showTrackDetails(track) {
    Validator.isInstance(track, Track);

    selectedTrack = track;

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
        </div>`;

    // leaderboard info
    let lbBody = document.getElementById("details-leaderboard");

    function constructLeaderboard(scores) {
        let table = document.createElement("table");
        table.classList.add("table", "table-light", "table-bordered", "text-center");

        // headers
        let thead = document.createElement("thead");
        let theadr = document.createElement("tr");
        let headers = ["#", "Name", "Time (s)", "Car Type", "Date"];

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
            
            tbody.appendChild(tr);
            rank += 1;
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    let leaderboard = leaderboards.find(l => l._id == track.getId());
    let lbContent = null;

    lbBody.innerHTML = "<div class='text-center'><b>Track Times</b></div>";

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

    // TODO: when "players" are a thing, only allow
    //   editing / deleting for personal tracks

    let author = track.getAuthor();
    let modifiable = !(author != "" && author != "Game");
    document.getElementById("details-edit").hidden = modifiable;
    document.getElementById("details-delete").hidden = modifiable;
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


async function startLobby(track, locality) {
    Validator.isInstance(track, Track);

    let trackId = track.getId();

    let response = await fetch(`/api/lobbies/${locality}`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json"}),
        body: JSON.stringify({ playerId, trackId })
    });

    if (response.ok) {
        let result = await response.json();
        window.location.href = `/lobbies/${result.lobbyId}`;

    } else {
        throw new Error(`Couldn't create lobby: ${response.statusText}`)
    }
}


/*
function startLobby(track) {
    if (!track) {
        throw new Error(`[Tracks List] No track provided to play`);
    }

    if (lobby.getRacers().length == 0) { // solo race
        addDefaultRacer(PLAYER_TYPE.Player);
    }    

    // NOTE: use this when using an actual lobby system 
    (async () => {
        await fetch("/tracks/play", {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json"}),
            body: JSON.stringify({ trackId: track.getId(), racers })
        });
    })();

    for (let data of ghostData) {
        let ghost = addDefaultRacer(PLAYER_TYPE.Ghost);
        ghost.Colour = "#777";
        ghost.Moves = data.moves
        ghost.CarType = data.carType || Object.keys(RACECAR_INFO)[0];
    }

    let trackId = track.getId();
    let lobbyJson = JSON.stringify(lobby);
    let lobbyEncoded = encodeURIComponent(lobbyJson);

    window.location.href = `/tracks/play/${trackId}?lobby=${lobbyEncoded}`;
}
*/



// [[ Set Up ]] //

// through ejs
let tracks = tracks_.map(t => Track.toInstance(t));
let leaderboards = leaderboards_;

loadAllTracks(tracks);

initialiseTrackSearch();

initialiseTrackDetails();

GeneralUI.prepareTooltips();