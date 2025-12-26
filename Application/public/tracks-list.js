// manages the tracks list section


// [[ Variables ]] //
import Track from "./classes/track.js";


// [[ Functions ]] //

// loads all available tracks for the game
function loadAllTracks(tracks) {
    let list = document.getElementById("game-tracks");

    tracks = tracks.map(t => Track.toTrack(JSON.parse(t)));

    for (let track of tracks) {
        let item = document.createElement("li");
        item.innerHTML = `<a href='javascript:void(0)'>${track.getName()}</a>`;
        
        item.addEventListener("click", (e) => {
            loadTrack(track);
        });

        list.appendChild(item);
    }
}


// loads the given track via the gameplay script
function loadTrack(track) {
    window.location.href = window.location.origin 
        + `/tracks/play/${track.getTrackId()}`;
}



// [[ Set Up ]] //

loadAllTracks(gameTracks);