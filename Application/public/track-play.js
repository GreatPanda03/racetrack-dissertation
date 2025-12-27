// manages racing gameplay
// * source: "How to check if two given line segments intersect?", GeeksforGeeks, geeksforgeeks.org, [Online]. Accessed: Nov 29, 2025. Available at: https://www.geeksforgeeks.org/dsa/check-if-two-given-line-segments-intersect/
// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.



// [[ Imports ]] //
import Vector2 from "./classes/vector2.js";
import Track from "./classes/track.js";
import TrackRenderer from "./classes/track-renderer.js";
import RaceCar from "./classes/racecar.js";



// [[ Variables ]] //

// gameplay
var track = null;
var racecar = null;

// rendering
var renderer = null;
var trackCanvas = document.getElementById("track-canvas");
var playCanvas = document.getElementById("play-canvas");

var spacing = 25; // pixels between each grid cell
var spotRadius = 10;
var racecarRadius = 7;
var offset = new Vector2();

var racecarPath = [];
var boundaries = [];
var isPlaying = false;
var checkpoints = []; // {Node: node, Passed: boolean}
var raceStats = {};

// TODO: have 1 canvas for the track, another canvas for race cars
// * that way, when updating race cars, only the top canvas needs
//     to be cleared, not the bottom race track (which is pretty 
//     much static)
// * source: https://stackoverflow.com/questions/7603142



// [[ Gameplay & Controls ]] //

// loads the given track 
function loadTrack(t) {
    track = Track.toTrack(JSON.parse(t));
    renderer = new TrackRenderer(track, trackCanvas);

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

    racecarPath = [racecar.getPosition()];
    boundaries = getTrackBoundaries(renderer);
    checkpoints = getTrackCheckpoints(track);
    raceStats = getBlankRaceStats();

    isPlaying = true;

    renderRaceCar();
    displayMoves();
}


// returns the boundaries of given renderer's track
function getTrackBoundaries(renderer) {
    let boundaries = [];

    // auxiliary: returns each consecutive node pair as boundary lines
    function gatherBoundaries(nodes) {
        let size = nodes.length;

        for (let n = 0; n < size - 1; n++) {
            let boundary = [nodes[n].getPosition(), nodes[n + 1].getPosition()];
            boundaries.push(boundary);
        }

        // last-first boundary
        let boundary = [nodes[size - 1].getPosition(), nodes[0].getPosition()];
        boundaries.push(boundary);
    }

    gatherBoundaries(renderer.getLeftSide());
    gatherBoundaries(renderer.getRightSide());  
    
    return boundaries;
}


// returns all checkpoints in the track
function getTrackCheckpoints(track) {
    let checkpoints = [];

    for (let node of track.getPath()) {
        if (node.isCheckpoint()) {
            checkpoints.push({node: node, passed: false});
        }
    }

    return checkpoints;
}


// returns a blank dictionary of race stats
function getBlankRaceStats() {
    return {
        moves: 0,
        distance: 0,
        time: 0,
        topSpeed: 0,
        // averageSpeed: distance / time
    }
}


// allows the canvas to be interacted with to detect move choices
function initialisePlayCanvas() {
    playCanvas.addEventListener("click", (e) => {
        if (!isPlaying) return;

        let mousePos = getRelativePositionOnCanvas(playCanvas, e.clientX, e.clientY);
        let centre = racecar.getPosition().add(racecar.getVelocity());

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) { 
                let oldPos = racecar.getPosition().scale(spacing);

                let gridPos = centre.add(new Vector2(x, y));
                let newPos = gridPos.scale(spacing);
                let direction = mousePos.sub(newPos);

                if (direction.mag() > 10) continue; // beyond click region

                // move car to location
                racecar.accelerate(new Vector2(x, y));
                racecar.move();
                racecarPath.push(gridPos);
                renderRaceCar();

                let speed = racecar.getVelocity().mag();
                let topSpeed = raceStats.topSpeed;

                raceStats.moves += 1;
                raceStats.distance += speed
                raceStats.time += 1;
                raceStats.topSpeed = speed > topSpeed ? speed : topSpeed;

                // [source 1] collision detection
                let ray = new Vector2(10000, 0);
                let crosses = 0;

                for (let boundary of boundaries) {
                    let crossed = doLinesIntersect(newPos, ray, boundary[0], boundary[1]);
                    if (crossed) crosses += 1;
                }

                if (crosses % 2 == 0) {
                    endRace("crashed");
                    return;
                }

                // passing main checkpoints (only counts if previous checkpoints have been passed)
				// * also accumulating passes for finish line if crossed

                // * TODO: handle logic for 0 checkpoints - can just recross start...
                //     force at least ONE checkpoint half way around the track?
                let allPassed = true;

                for (let [c1, checkpoint] of checkpoints.entries()) {
                    let index = track.getNodeIndex(checkpoint.node);
                    let left = renderer.getLeftSide()[index].getPosition();
                    let right = renderer.getRightSide()[index].getPosition();

                    let crossed = doLinesIntersect(oldPos, newPos, left, right);

                    if (crossed) {
                        let valid = true;

                        for (let c2 = 0; c2 < c1 - 1; c2++) {
                            if (!checkpoints[c2].passed) {
                                // console.log(`Checkpoint ${c1 + 1} doesn't count 
                                //   Checkpoint ${c2 + 1} hasn't been passed yet!`);

                                valid = false;
                                break;
                            }
                        }

                        checkpoint.passed = valid;
                    }

                    if (!checkpoint.passed) {
                        allPassed = false;
                    }
                }

                // passing starting line with all checkpoints crossed (win condition)
                if (allPassed) {
                    let left = renderer.getLeftSide()[0].getPosition();
                    let right = renderer.getRightSide()[0].getPosition();

                    let crossed = doLinesIntersect(oldPos, newPos, left, right);

                    if (crossed) {
                        endRace("win");
                        return;
                    }
                }

                // TODO: if the finished line is crossed, adjust time accordingly

                // if okay & unfinished, prompt next move
                displayMoves();
            }
        }
    });
}


// [source 2] returns whether the two given lines intersect (Vector2 points)
function doLinesIntersect(p11, p12, p21, p22) {
    function onSegment(p, q, r) {
        return ( q.x() <= Math.max( p.x(), r.x() ) && q.x() >= Math.min( p.x(), r.x() ) )
            && ( q.y() <= Math.max( p.y(), r.y() ) && q.y() >= Math.min( p.y(), r.y() ) );
    }

    function getOrientation(p, q, r) {
        let value = ( q.y() - p.y() ) * ( r.x() - q.x() ) - ( q.x() - p.x() ) * ( r.y() - q.y() );
        return value == 0 ? 0 : (value > 0 ? 1 : 2);
    }

    let o1 = getOrientation(p11, p12, p21);
	let o2 = getOrientation(p11, p12, p22);
	let o3 = getOrientation(p21, p22, p11);
	let o4 = getOrientation(p21, p22, p12);
	
	return ( o1 != o2 && o3 != o4 )
		|| ( o1 == 0 && onSegment(p11, p21, p12) )
		|| ( o2 == 0 && onSegment(p11, p22, p12) )
		|| ( o3 == 0 && onSegment(p21, p11, p22) )
		|| ( o4 == 0 && onSegment(p21, p12, p22) );   
}


// officially ends the race
function endRace(outcome) {
    raceStats.averageSpeed = raceStats.distance / raceStats.time;

    let titleText;

    let results = document.getElementById("modal-race-results")
        .getElementsByClassName("results")[0];

    results.innerHTML = 
        `<p>
            <b>Total Moves:</b> ${raceStats.moves}<br>
            <b>Distance:</b> ${(raceStats.distance).toFixed(3)} m<br>
            <b>Time:</b> ${(raceStats.time).toFixed(3)} s<br>
            <b>Average Speed:</b> ${(raceStats.distance / raceStats.time).toFixed(3)} ms⁻²<br>
            <b>Top Speed:</b> ${(raceStats.topSpeed).toFixed(3)} ms⁻²
        </p>`;

    if (outcome == "crashed") {
        $("#modal-race-results").modal("show");
        titleText = "You Crashed!";

    } else if (outcome == "win") {
        $("#modal-race-results").modal("show");
        titleText = "You Finished the Race!";
    }

    let title = document.getElementById("modal-race-results")
        .getElementsByClassName("modal-title")[0];

    title.innerHTML = titleText;

    isPlaying = false;
    console.log(raceStats);
}



// [[ Canvas Visualisations ]] // 

// renders the race car to the track
function renderRaceCar() {
    let ctx = playCanvas.getContext("2d");
    let pos = racecar.getPosition().scale(spacing);

    ctx.clearRect(-offset.x(), -offset.y(), playCanvas.width, playCanvas.height);
    
    ctx.fillStyle = "#A00";
    ctx.beginPath();
    ctx.ellipse(pos.x(), pos.y(), racecarRadius, racecarRadius, 0, 2 * Math.PI, 0);
    ctx.fill();

    // first dot of race path
    let firstDot = racecarPath[0].scale(spacing);
    ctx.beginPath();
    ctx.ellipse(firstDot.x(), firstDot.y(), 3, 3, 0, 2 * Math.PI, 0);
    ctx.fill();

    for (let p = 0; p < racecarPath.length - 1; p ++) {
        let start = racecarPath[p].scale(spacing);
        let end = racecarPath[p + 1].scale(spacing);

        ctx.strokeStyle = "#A00";
        ctx.beginPath();
        ctx.moveTo(start.x(), start.y());
        ctx.lineTo(end.x(), end.y());
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(end.x(), end.y(), 3, 3, 0, 2 * Math.PI, 0);
        ctx.fill();
    }
}


// displays the available subsequent velocities for the player
function displayMoves() {
    let centre = racecar.getPosition().add(racecar.getVelocity());

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            let gridPos = centre.add(new Vector2(x, y));
            let pos = gridPos.scale(spacing);

            let ctx = playCanvas.getContext("2d");
            ctx.strokeStyle = "#A00";
            ctx.beginPath();
            ctx.ellipse(pos.x(), pos.y(), spotRadius, spotRadius, 0, 2 * Math.PI, 0);
            ctx.stroke();
        }
    }
}


// returns the position of the mouse relative to the canvas
// * TODO: make this a generic utility function?
function getRelativePositionOnCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();

    return new Vector2(
        x - rect.left - offset.x(), 
        y - rect.top  - offset.y()
    );
}



// [[ Set Up ]] //

initialisePlayCanvas();

loadTrack(window.track);