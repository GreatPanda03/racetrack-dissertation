// manages instances of RaceStats objects
// * RaceStats stores live race statistics about a player

// * source: holdensclass (2019), "Acceleration Equation x = vit + 1/2at^2 in use and how to rearrange", [Online Video]. Available at: https://www.youtube.com/watch?v=-fCvkUZPxX4. Accessed: Feb. 8, 2026.

import Vector2 from "../geometry/vector2.js";
import Line from "../geometry/line.js";
import Track from "../track/track.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import Validator from "../../utilities/validator.js";


export default class RaceStats {
    #playerId;      // string
    #moves;         // [[path: Line, velocity: Velocity], ...]
    #distance;      // float
    #time;          // float
    #topSpeed;      // float
    #checkpoints;   // [{index: int, passed: boolean}, ...]
    #state;         // RACECAR_STATE (enum)
    #crashes;       // int

    constructor(track, playerId) {
        if (!track && !playerId) { // assumes empty
            return;
        }

        Validator.isInstance(track, Track);
        Validator.isPrimitive(playerId, "string");
        
        this.#playerId = playerId;
        this.#moves = [];
        this.#distance = 0;
        this.#time = 0;
        this.#topSpeed = 0;
        this.#checkpoints = [];
        this.#state = RACECAR_STATE.Racing;
        this.#crashes = 0;

        let path = track.getPath();

        for (let n = 1; n < track.getSize(); n++) {
            let node = path[n];

            if (node.isCheckpoint()) {
                this.#checkpoints.push({index: n, passed: false});
            }
        }
    }
    

    // getters / setters
    getPlayerId() { return this.#playerId; }
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

    getCrashes() { return this.#crashes; }
    addCrash() { this.#crashes += 1; }
    

    // methods
    addMove(line, velocity) {
        Validator.isInstance(line, Line);
        Validator.isInstance(velocity, Vector2);

        this.#moves.push({Path: line, Velocity: velocity});
    }
    
    calculateStats() {
        let moves = this.#moves;

        let totalDistance = 0;
        let totalTime = 0;
        let topSpeed = 0;

        let state = this.getState();

        // total distance & speed stats
        for (let move of moves) {
            let line = move.Path;
            let velocity = move.Velocity;

            let distance = line.end.sub(line.start).mag();
            let speed = velocity.mag();

            totalDistance += distance;
            topSpeed = Math.max(speed, topSpeed);
        }

        // total elapsed time
        if (state == RACECAR_STATE.Racing || moves.length == 0) {
            totalTime = moves.length;

        } else {
            let final = moves[moves.length - 1];
            let line = final.Path;
            let velocity = final.Velocity;

            let distance = line.end.sub(line.start).mag();
            let speed = velocity.mag();
            let time = speed > 0 ? distance / speed : 1;

            totalTime = (moves.length - 1) + time;
        }
        
        this.#distance = totalDistance;
        this.#time = totalTime;
        this.#topSpeed = topSpeed;

        // TODO: should TECHNICALLY use [source 1]...
        // * velocity change isn't instantaneous! 
    }


    // serialisation
    toObject() {
        let moves = [];

        for (let move of this.#moves) {
            moves.push({
                Path: move.Path.toObject(), 
                Velocity: move.Velocity.toObject()
            });
        }

        let checkpoints = [];
        for (let checkpoint of this.#checkpoints) {
            checkpoints.push({
                index: checkpoint.index,
                passed: checkpoint.passed
            });
        }

        return {
            playerId: this.#playerId,
            moves: moves,
            distance: this.#distance,
            time: this.#time,
            topSpeed: this.#topSpeed,
            checkpoints: checkpoints,
            state: this.#state,
            crashes: this.#crashes
        }
    }

    static toInstance(object) {
        let stats = new RaceStats();

        let moves = [];
        for (let move of object.moves ?? []) {
            moves.push({
                Path: Line.toInstance(move.Path),
                Velocity: Vector2.toInstance(move.Velocity)
            });
        }

        let checkpoints = [];
        for (let checkpoint of object.checkpoints ?? []) {
            checkpoints.push({
                index: checkpoint.index, 
                passed: checkpoint.passed
            });
        }

        stats.#playerId = object.playerId;
        stats.#moves = moves;
        stats.#distance = object.distance;
        stats.#time = object.time;
        stats.#topSpeed = object.topSpeed;
        stats.#checkpoints = checkpoints;
        stats.#state = object.state;
        stats.#crashes = object.crashes;

        return stats;
    }

    toJSON() {
        return this.toObject();
    }
}