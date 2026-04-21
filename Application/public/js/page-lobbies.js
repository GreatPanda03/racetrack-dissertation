// manages the lobby list section


// [[ Imports ]] //
import {
    Lobby,
    Track,
    PLAYER_TYPE
} from "/core/index.js";

import { initAuth } from "./firebase.js";

import GeneralUI from "./utilities/general-ui.js";

lucide.createIcons();



// [[ Variables ]] //
var user = await initAuth();
var playerId = user.uid;



// [[ Data Retrieval ]] //

async function getLobbies() {
    let lobbiesJson = await fetch("/api/lobbies").then(r => r.json());
    let lobbiesObj = lobbiesJson.lobbies;
    let ids = Object.keys(lobbiesObj);
    let lobbies = ids.map(id => Lobby.toInstance(lobbiesObj[id]));

    return lobbies;
}

async function getTrack(trackId) {
    let trackJson = await fetch(`/api/tracks/${trackId}`).then(r => r.json());
    let track = Track.toInstance(trackJson.track);

    return track;
}



// [[ Lobby Entry Management ]] //

function createLobbyEntry(lobby, track) {
    let entryTemplate = document.getElementById("lobby-entry-template");
    let entry = document.importNode(entryTemplate.content, true);
    
    let title = entry.querySelector(".entry-lobby-title");
    let details = entry.querySelector(".entry-body");
    let canvas = entry.querySelector(".entry-canvas");
    let trackName = entry.querySelector(".entry-track-name");

    // populating entry
    let players = Object.values(lobby.getPlayers());
    let playerCount = players.filter(p => p.getPlayerType() == PLAYER_TYPE.Player).length;
    let robotCount = players.filter(p => p.getPlayerType() == PLAYER_TYPE.Robot).length;

    title.innerHTML = `Lobby (ID: ${lobby.getId()})`;
    details.innerHTML = `
        <b>Host:</b> Player ${lobby.getHostId()}
        <br><b>Players:</b> ${playerCount}
        <br><b>Robots:</b> ${robotCount}`;

    GeneralUI.generateTrackPreview(canvas, track, 25)

    trackName.innerHTML = `<b>${track.getName()}`;

    return entry;
}



// [[ Lobby Listing ]] //

async function refreshLobbies() {
    let listTitle = document.getElementById("lobby-list-description");
    let lobbyList = document.getElementById("lobby-list-body");

    let lobbies = await getLobbies();

    // list header
    if (lobbies.length == 1) {
        listTitle.innerHTML = `There is <b>${lobbies.length}</b> online lobby.`;
    } else {
        listTitle.innerHTML = `There are <b>${lobbies.length}</b> online lobbies.`;
    }

    if (lobbies.length == 0) {
        listTitle.innerHTML += " <b>Be the first to create one!</b>";
    }

    // populating list
    lobbyList.innerHTML = "";

    for (let lobby of lobbies) {
        let trackId = lobby.getTrackId();
        let track = await getTrack(trackId);

        let entry = createLobbyEntry(lobby, track);

        let joinBtn = entry.querySelector(".entry-join");
        joinBtn.addEventListener("click", async (e) => {
            let lobbyId = lobby.getId();

            let joinJson = await fetch(`/api/lobbies/join/${lobbyId}`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ playerId })
            }).then(r => r.json());

            if (joinJson.success) {
                window.location.href = `/lobbies/${lobbyId}`;

            } else {
                let toast = GeneralUI.createToast(
                    "Failed to Join Lobby", 
                    joinJson.error, 
                    "#A00");
            }
        });

        lobbyList.appendChild(entry);
    }
}



// [[ Page UI ]] //

function initialiseInterface() {
    let refreshBtn = document.getElementById("refresh-lobbies");

    refreshBtn.addEventListener("click", (e) => {
        refreshLobbies();
    });
}



// [[ Set Up ]] //

refreshLobbies();

GeneralUI.prepareTooltips();
