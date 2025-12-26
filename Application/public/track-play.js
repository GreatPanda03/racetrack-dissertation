// manages racing gameplay


// [[ Imports ]] //
import Vector2 from "./classes/vector2.js";
import Track from "./classes/track.js";
import TrackRenderer from "./classes/track-renderer.js";
import RaceCar from "./classes/racecar.js";



// [[ Variables ]] //

// gameplay
let track = null;
let racecar = null;

// rendering
let canvas = document.getElementById("play-canvas");
let renderer = null;

let spacing = 25; // pixels between each grid cell
let spotRadius = 10;
let racecarRadius = 7;
let offset = new Vector2();


// TODO: have 1 canvas for the track, another canvas for race cars
// * that way, when updating race cars, only the top canvas needs
//     to be cleared, not the bottom race track (which is pretty 
//     much static)
// * source: https://stackoverflow.com/questions/7603142


// [[ Functions ]] //

// loads the given track 
function loadTrack(t) {
    track = Track.toTrack(JSON.parse(t));
    renderer = new TrackRenderer(track, canvas);

    for (let node of track.getPath()) {
        renderer.addSegment(node);
    }

    renderer.setNodesVisible(false);
    renderer.setEdgesVisible(false);

    renderer.redrawTrack();

    // preparing the race car
    let startPos = track.getPath()[0].getPosition();

    racecar = new RaceCar();
    racecar.setPosition(new Vector2(
        Math.round(startPos.x() / spacing),
        Math.round(startPos.y() / spacing)
    ));

    renderRaceCar();

    promptMove();
}


// renders the race car to the track
function renderRaceCar() {
    let ctx = renderer.getCanvas().getContext("2d");
    let pos = racecar.getPosition().scale(spacing);

    ctx.fillStyle = "#A00";
    ctx.beginPath();
    ctx.ellipse(pos.x(), pos.y(), racecarRadius, racecarRadius, 0, 2 * Math.PI, 0);
    ctx.fill();
}


// prompts the player to move their race car
function promptMove() {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            let pos = ( centre.add(new Vector2(x, y)) ).scale(spacing);

            let ctx = renderer.getCanvas().getContext("2d");
            ctx.strokeStyle = "#A00";
            ctx.beginPath();
            ctx.ellipse(pos.x(), pos.y(), spotRadius, spotRadius, 0, 2 * Math.PI, 0);
            ctx.stroke();         
        }
    }
}


// allows the canvas to be interacted with to detect move choices
function initialiseCanvas() {
    canvas.addEventListener("click", (e) => {
        let mousePos = getRelativePositionOnCanvas(e.clientX, e.clientY);
        let centre = racecar.getPosition().add(racecar.getVelocity());

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                let pos = ( centre.add(new Vector2(x, y)) ).scale(spacing);
                let direction = mousePos.sub(pos);

                if (direction.mag() < 10) {
                    racecar.accelerate(new Vector2(x, y));
                    racecar.move();
                    renderer.redrawTrack();
                    renderRaceCar();

                    promptMove();
                }
            }
        }
    });
}


// returns the position of the mouse relative to the canvas
// * TODO: make this a generic utility function?
function getRelativePositionOnCanvas(x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x(), 
        y - rect.top  - offset.y()
    );
}



// [[ Set Up ]] //

initialiseCanvas();

loadTrack(window.track);