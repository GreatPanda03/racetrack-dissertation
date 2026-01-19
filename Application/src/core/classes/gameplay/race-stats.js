// manages instances of RaceStats objects
// * RaceStats stores live race statistics about a player


// [[ Imports ]] //
import Vector2 from "../geometry/vector2.js";
import Track from "../track/track.js";
import RACECAR_STATE from "../../enums/racecar-state.js";



// [[ Main Class ]] //
export default class RaceStats {
    #track;         // Track
    #path;          // [[Vector2, Vector2], ...]
    #distance;      // float
    #time;          // float
    #topSpeed;      // float
    #checkpoints    // [{node: TrackNode, passed: boolean}, ...]
    #state;         // RacecarState (enum)

    constructor(track) {
        if ( !(track instanceof Track) ) {
            throw new Error(`[RaceStats] "${track}" is not a Track`);
        }
        
        this.#track = track;
        this.#path = []
        this.#distance = 0;
        this.#time = 0;
        this.#topSpeed = 0;
        this.#checkpoints = [];
        this.#state = RACECAR_STATE.Racing;

        let path = track.getPath();

        for (let n = 1; n < track.getSize(); n++) {
            let node = path[n];

            if (node.isCheckpoint()) {
                this.#checkpoints.push({node: node, passed: false});
            }
        }
    }
    

    // getters / setters
    getTrack() { return this.#track; }
    getPath() { return this.#path; }
    getDistance() { return this.#distance; }
    getTime() { return this.#time; }
    getTopSpeed() { return this.#topSpeed; }
    getCheckpoints() { return this.#checkpoints; }

    getState() { return this.#state; }
    setState(active) { this.#state = active; }


    // methods
    addToPath(point) {
        if ( !(point instanceof Vector2) ) {
            throw new Error(`[RaceStats] "${point}" is not a valid point`);
        }

        this.#path.push(point);

        let size = this.#path.length;
        if (size <= 1) return;

        let oldPos = this.#path[size - 2];
        let newPos = this.#path[size - 1];

        let speed = newPos.sub(oldPos).mag();
        let topSpeed = this.#topSpeed;
        
        this.#distance += speed
        this.#time += 1;
        this.#topSpeed = speed > topSpeed ? speed : topSpeed;
    }

    setCheckpointPassed(checkpoint, passed) {
        let info = this.#getCheckpointInfo(checkpoint);
        info.passed = passed;
    }

    isCheckpointPassed(checkpoint) {
        let info = this.#getCheckpointInfo(checkpoint);
        return info.passed;
    }

    getMoves() {
        return Math.max(this.#path.length - 1, 0); // first point of path is not a move
    }

    calculateStats() {
        let path = this.#path;

        let distance = 0;
        let topSpeed = 0;

        for (let p = 0; p < path.length - 1; p++) {
            let speed = path[p + 1].sub(path[p]).mag(); // divided by t
            distance += speed
            topSpeed = speed > topSpeed ? speed : topSpeed;
        }
        
        this.#distance = distance;
        this.#time = this.getMoves();
        this.#topSpeed = topSpeed;
    }


    // validation
    #getCheckpointInfo(node) {
        for (let checkpoint of this.#checkpoints) {
            if (checkpoint.node == node) {
                return checkpoint;
            }
        }
        
        throw new Error(`[RaceStats] "${node}" is not a recognised checkpoint`);
    }
}