// manages the tracks list section



// [[ Imports ]] //
import Track from "/core/classes/track/track.js";



// [[ Functions ]] //

// loads all available tracks for the game
function loadAllTracks(tracks) {
    let list = document.getElementById("game-tracks");

    tracks = tracks.map(t => Track.toInstance(JSON.parse(t)));

    for (let track of tracks) {
        let item = document.createElement("li");

        item.innerHTML = `<a href='javascript:void(0)'>
            <b>${track.getName()}</b></a> - ${track.getDescription()}.`;
        
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