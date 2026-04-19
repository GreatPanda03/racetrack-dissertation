// manages the lobby list section

import {
    Lobby,
    Track,
    TrackRenderer
} from "/core/index.js";


// [[ Variables ]] //



// [[ Functions ]] //

function createLobbyEntry(lobby, track) {
    let entryTemplate = document.getElementById("lobby-entry-template");
    let entry = document.importNode(entryTemplate.content, true);
    
    let title = entry.querySelector(".entry-lobby-title");
    let details = entry.querySelector(".entry-body");
    let canvas = entry.querySelector(".entry-canvas");
    let trackName = entry.querySelector(".entry-track-name");

    // populating entry
    title.innerHTML = `Lobby (ID: ${lobby.getId()})`;
    details.innerHTML = `
        <b>Host:</b> Player
        <b>Players:</b> 0
        <b>Robots:</b> 0`;

    let renderer = new TrackRenderer(track, canvas, 25);
    renderer.setVisibility("nodes", false);
    renderer.setVisibility("wires", false);
    renderer.setScale(canvas.width / 750);
    renderer.redrawTrack();

    trackName.innerHTML = `<b>${track.getName()}`;

    return entry;
}


async function loadLobbies() {
    let listTitle = document.getElementById("lobby-list-header");
    let lobbyList = document.getElementById("lobby-list-body");

    // lobby retrieval
    let lobbiesRes = await fetch("/lobbies");
    let lobbies = [];

    if (lobbiesRes.ok) {
        let lobbiesJson = await lobbiesRes.json();
            
        for (let lobby of lobbiesJson.lobbies) {
            lobbies.push(Lobby.toInstance(lobby));
        }
    }

    // populating list
    listTitle.innerHTML = `There are <b>${lobbies.length}</b> online lobbies.`;

    if (lobbies.length == 0) {
        listTitle.innerHTML += " <b>Be the first to create one!</b>";
    }

    for (let lobby of lobbies) {

        // track retrieval
        let trackRes = await fetch(`/tracks/${lobby.getTrackId()}`);
        let track = null;

        if (trackRes.ok) {
            let trackJson = await trackRes.json();
            track = Track.toInstance(trackJson.track);
        }

        let entry = createLobbyEntry(lobby, track);

        let joinBtn = entry.querySelector(".entry-join");
        joinBtn.addEventListener("click", async (e) => {
            let lobbyId = lobby.getId();

            let joinRes = await fetch("/lobbies/join", {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json"}),
                body: JSON.stringify({ lobbyId })
            });

            if (joinRes.ok) {
                window.href.location = `/lobbies/${lobbyId}`;
            }
        });

        lobbyList.appendChild(entry);
    }
}



// [[ Set Up ]] //

lucide.createIcons();

loadLobbies();