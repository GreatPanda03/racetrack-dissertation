// manages instances of RaceStats objects
// * RaceStats stores live race statistics about a player

// * source: holdensclass (2019), "Acceleration Equation x = vit + 1/2at^2 in use and how to rearrange", [Online Video]. Available at: https://www.youtube.com/watch?v=-fCvkUZPxX4. Accessed: Feb. 8, 2026.

import Vector2 from "../geometry/vector2.js";
import Line from "../geometry/line.js";
import Track from "../track/track.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import Validator from "../../utilities/validator.js";


export default class RaceStats {
    #track;         // Track
    #moves;         // [[path: Line, velocity: Velocity], ...]
    #distance;      // float
    #time;          // float
    #topSpeed;      // float
    #checkpoints    // [{node: TrackNode, passed: boolean}, ...]
    #state;         // RACECAR_STATE (enum)

    constructor(track) {
        Validator.isInstance(track, Track);
        
        this.#track = track;
        this.#moves = []
        this.#distance = 0;
        this.#time = 0;
        this.#topSpeed = 0;
        this.#checkpoints = [];
        this.#state = RACECAR_STATE.Racing;

        let path = track.getPath();

        for (let n = 1; n < track.getSize(); n++) {
            let node = path[n];

            if (node.isCheckpoint()) {
                this.#checkpoints.push({index: n, passed: false});
            }
        }
    }
    

    // getters / setters
    getTrack() { return this.#track; }
    getMoves() { return this.#moves; }
    getDistance() { return this.#distance; }
    getTime() { return this.#time; }
    getTopSpeed() { return this.#topSpeed; }
    getCheckpoints() { return this.#checkpoints; }

    getState() { return this.#state; }
    setState(state) {
        Validator.valuePresence(RACECAR_STATE, state);
        this.#state = state;
    }


    // methods
    addMove(line, velocity) {
        Validator.isInstance(line, Line);
        Validator.isInstance(velocity, Vector2);

        this.#moves.push({Path: line, Velocity: velocity});

        // TODO: should TECHNICALLY use [source 1]...
        // * velocity change isn't instantaneous! 

        let distance = line.end.sub(line.start).mag();
        let speed = velocity.mag();
        let topSpeed = this.#topSpeed;
        
        this.#distance += speed
        this.#time += speed > 0 ? distance / speed : 1;
        this.#topSpeed = speed > topSpeed ? speed : topSpeed;
    }
    
    calculateStats() {
        let moves = this.#moves;

        let totalDistance = 0;
        let totalTime = 0;
        let topSpeed = 0;

        for (let move of moves) {
            let line = move.Path;
            let velocity = move.Velocity;

            let distance = line.end.sub(line.start).mag();
            let speed = velocity.mag();
            let time = speed > 0 ? distance / speed : 1;

            totalDistance += distance;
            totalTime += time;
            topSpeed = Math.max(speed, topSpeed);
        }
        
        this.#distance = totalDistance;
        this.#time = totalTime;
        this.#topSpeed = topSpeed;
    }
}