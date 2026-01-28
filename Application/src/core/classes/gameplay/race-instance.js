// class to manage instance of RaceInstance objects
// * RaceInstance represents an active race session with details about 
//     racecars and the game state

// * source: "How to check if two given line segments intersect?", GeeksforGeeks, geeksforgeeks.org, [Online]. Accessed: Nov 29, 2025. Available at: https://www.geeksforgeeks.org/dsa/check-if-two-given-line-segments-intersect/
// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.

import Vector2 from "../geometry/vector2.js";
import TrackBoundaries from "../track/track-boundaries.js";
import RaceCar from "../gameplay/racecar.js";
import RaceStats from "../gameplay/race-stats.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import MATERIAL_INFO from "../../enums/material-info.js";


export default class RaceInstance {
    #track;         // Track
    #boundaries;    // TrackBoundaries
    #racecars;      // RaceCar[]
    #raceStats;     // {RaceCar: RaceStats}

    constructor(track, racecars = []) {
        this.#track = track;
        this.#boundaries = new TrackBoundaries(track);
        this.#racecars = [];
        this.#raceStats = {};

        if (racecars.length > 0) {
            for (let racecar of racecars) this.addRacecar(racecar);
            this.prepareRacecars();
        }
    }

    // getters / setters
    getTrack() { return this.#track; }
    getBoundaries() { return this.#boundaries; }
    getRacecars() { return this.#racecars; }
    getRaceStats() { return this.#raceStats; }


    // methods
    addRacecar(racecar) {
        let track = this.#track;
        let racecars = this.#racecars;
        let raceStats = this.#raceStats;

        if (! (racecar instanceof RaceCar) ) {
            throw new Error(`[RaceInstance] "${racecar}" is not a valid RaceCar`);
        }

        if (racecars.includes(racecar)) {
            throw new Error(`[RaceInstance] "${racecar}" is already in the race`);
        }

        racecars.push(racecar);
        raceStats[racecar] = new RaceStats(track);
    }

    getRacecarStats(racecar) {
        let raceStats = this.#raceStats;

        if ( !(racecar in raceStats) ) {
            throw new Error(`[RaceInstance] "${racecar}" does not have stats`);
        }

        return raceStats[racecar];
    }

    prepareRacecars() {
        let track = this.#track;
        let raceStats = this.#raceStats;
        let racecars = this.#racecars;

        let startPos = track.getPath()[0].getPosition();
        
        for (let racecar of racecars) {
            racecar.setPosition(new Vector2(
                Math.round(startPos.x() / 25), // TODO: use grid spacing
                Math.round(startPos.y() / 25)
            ));

            raceStats[racecar].addToPath(racecar.getPosition());
        }
    }

    moveRacecar(racecar, acceleration) {
        if ( !(racecar instanceof RaceCar) ) {
            throw new Error(`[RaceInstance] "${racecar}" is not a valid RaceCar`);
        }

        if ( !(acceleration instanceof Vector2) ) {
            throw new Error(`[RaceInstance] "${acceleration}" is not a valid Vector2`);
        }

        let track = this.#track;
        let boundaries = this.#boundaries;
        let stats = this.#raceStats[racecar];

        if (!stats) {
            throw new Error(`[RaceInstance] "${racecar}" has no stats to update for move`);
        }

        let oldPos = racecar.getPosition().scale(25);

        racecar.accelerate(acceleration);
        racecar.move();
        stats.addToPath(racecar.getPosition());

        let newPos = racecar.getPosition().scale(25);

        // passing main checkpoints (must pass previous ones first)
        // * also accumulating passes for finish line if crossed

        // * TODO: handle logic for 0 checkpoints - can just recross start...
        //     force at least ONE checkpoint half way around the track?
        let allPassed = true;
        let checkpoints = stats.getCheckpoints();

        for (let [c1, checkpoint] of checkpoints.entries()) {
            let index = track.getNodeIndex(checkpoint.node);
            let left = boundaries.getLeftSide()[index].getPosition();
            let right = boundaries.getRightSide()[index].getPosition();

            let crossed = TrackBoundaries.doLinesIntersect(oldPos, newPos, left, right);

            if (crossed) {
                let valid = true;

                for (let c2 = 0; c2 < c1 - 1; c2++) {
                    if (!checkpoints[c2].passed) {
                        valid = false;
                        break;
                    }
                }

                stats.setCheckpointPassed(checkpoint.node, valid);
            }

            if (!checkpoint.passed) {
                allPassed = false;
            }
        }

        // passing the finish line with all checkpoints crossed (win condition)
        if (allPassed) {
            let index = track.isLooped() ? 0 : track.getSize() - 1;

            let left = boundaries.getLeftSide()[index].getPosition();
            let right = boundaries.getRightSide()[index].getPosition();

            let crossed = TrackBoundaries.doLinesIntersect(
                oldPos, newPos, left, right);

            if (crossed) {
                stats.setState(RACECAR_STATE.Finished);
                return;
            }
        }

        // [source 2] track boundary collision detection
        // * check for crashes last, in case crossing the finish line
        for (let boundary of boundaries.getBoundaries()) {
            let crossed = TrackBoundaries.doLinesIntersect(oldPos, newPos, boundary[0], boundary[1]);
            if (crossed) stats.setState(RACECAR_STATE.Crashed);
        }

        // TODO: if the crash boundary / finish line is crossed, adjust time accordingly

        /*

        * source: https://www.youtube.com/watch?v=bvlIYX9cgls
        * - calculates an alpha and a beta, then determines whether they intersect or not
        *     based on the values they have...
        * ... but since i already check for an intersection, i can just use whatever value
        *   either alpha or beta produce
        * 
        * alpha = (p22.x - p21.x) * (p21.y - p11.y) - (p22.y - p21.y) * (p21.x - p11.x)
        *       / (p22.x - p21.x) * (p12.y - p11.y) - (p22.y - p21.y) * (p12.x - p11.x)
        * 
        * direction = p21.sub(p11)
        * 
        * :. distance travelled = alpha * direction

        
        * source: https://www.youtube.com/watch?v=-fCvkUZPxX4
        * 
        * using the distance over acceleration, calculate the time
        * :. d = 0.5 * a * t^2
        * => t = sqrt(2d / a)
        * 
        * ... then add this result onto the final time!
        * (or deduct from 1s if i can't figure out how to NOT do the last stat update)

        */
    }

    getPossibleMoves(racecar) {

        /*
            * TODO: MAYBE rework this so that ALL INDIVIDUAL MOVE LINES are considered
            * for example - if a car's line to the CENTRAL dot crosses the material,
                then it's acceleration relative to THAT move is affected
            * ... but if the player picks a point which doesn't cross the material,
                then the car's speed shouldn't be affected at all (and they should still be able to go there)
            * basically - the edge points shouldn't be determined by the central
                point if they can be travelled to without crossing the material

            * ALSO: not sure if race car should be affected at all
                if it entirely crosses the material...
            * Vector Racer ONLY affects the car if it's IN the material
        */

        // determining the current material (if any)
        let pos = racecar.getPosition().scale(25);
        let ray = new Vector2(10000, 0);

        let track = this.#track; 
        let materials = track.getMaterials();
        let onMaterial = null;

        for (let material of materials) {
            let crosses = 0;
            let edges = material.getEdges();
            
            for (let edge of edges) {
                let crossed = TrackBoundaries.doLinesIntersect(pos, ray, edge[0], edge[1]);
                if (crossed) crosses += 1;
            }

            if (crosses % 2 == 1) {
                onMaterial = material;
                break;
            }
        }

        // gathering possible moves based on material
        let moves = [];
        let acc = racecar.getMaxAcceleration().x();
        let effect;

        if (onMaterial) {
            let type = onMaterial.getType();

            if ( !(type in MATERIAL_INFO) ) {
                throw new Error(`[RaceInstance] "${type}" is not a recognised material`);
            }

            effect = MATERIAL_INFO[type].Effect;

        } else {
            effect = (racecar, x, y) => {
                return {
                    Offset: new Vector2(x, y),
                    Active: true
                }
            }
        }

        for (let x = -acc; x <= acc; x++) {
            for (let y = -acc; y <= acc; y++) {
                let move = effect(racecar, x, y);
                moves.push(move);
            }
        }

        // further limiting moves based on max speed
        let velocity = racecar.getVelocity();
        let maxSpeed = racecar.getMaxSpeed();

        for (let move of moves) {
            let finalVelocity = velocity.add(move.Offset);

            if (
                   Math.abs(finalVelocity.x()) > maxSpeed.x()
                || Math.abs(finalVelocity.y()) > maxSpeed.y()
            ) {
                move.Active = false;
            }
        }

        return moves;
    }
}