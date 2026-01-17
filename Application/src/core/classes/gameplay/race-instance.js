// class to manage instance of RaceInstance objects
// * RaceInstance represents an active race session with details about 
//     racecars and the game state

// * source: "How to check if two given line segments intersect?", GeeksforGeeks, geeksforgeeks.org, [Online]. Accessed: Nov 29, 2025. Available at: https://www.geeksforgeeks.org/dsa/check-if-two-given-line-segments-intersect/
// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.


// [[ Imports ]] //
import Vector2 from "../geometry/vector2.js";
import TrackBoundaries from "../track/track-boundaries.js";
import RaceCar from "../gameplay/racecar.js";
import RaceStats from "../gameplay/race-stats.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import MATERIAL_INFO from "../../enums/material-info.js";



// [[ Main Class ]] //
export default class RaceInstance {
    #track;         // Track
    #boundaries;    // TrackBoundaries
    #racecars;      // RaceCar[]
    #raceStats;     // {RaceCar: RaceStats}

    // TODO: add "racecars" parameters to automatically add and
    //   position racecars (tedious to remember .prepareRacecars() )

    constructor(track) {
        this.#track = track;
        this.#boundaries = new TrackBoundaries(track);
        this.#racecars = [];
        this.#raceStats = {};
    }

    // getters / setters
    getTrack() { return this.#track; }
    getBoundaries() { return this.#boundaries; }
    getRacecars() { return this.#racecars; }
    getRaceStats() { return this.#raceStats; }


    // methods

    // adds the given racecar to the race
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

    // returns the race stats associated with the given race car
    getRacecarStats(racecar) {
        let raceStats = this.#raceStats;

        if ( !(racecar in raceStats) ) {
            throw new Error(`[RaceInstance] "${racecar}" is does not have stats`);
        }

        return raceStats[racecar];
    }

    // moves all racecars to the starting line
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

    // applies the given acceleration to the given race car
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

        // * TODO: add obstacle polygon sides as boundary lines

        // TODO: if the finished line is crossed, adjust time accordingly
    }

    // returns the given racecar's moveset based on the 
    //   material it's on (if any)
    getPossibleMoves(racecar) {

        /*
            * TODO: rework this so that ALL INDIVIDUAL MOVE LINES are considered
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

        // determining current material (if any)
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

        // gathering possible moves
        let moves = [];
        let acc = racecar.getMaxAcceleration();

        if (onMaterial) {
            let type = onMaterial.getType();

            if (type == MATERIAL_INFO.Curb.Name) {
                for (let x = -acc; x <= acc; x++) {
                    for (let y = -acc; y <= acc; y++) {
                        let move = {
                            Offset: new Vector2(x, y),
                            Active: (x == 0 || y == 0) // TODO
                        };

                        moves.push(move);
                    }
                }

            } else if (type == MATERIAL_INFO.Gravel.Name) {
                let velocity = racecar.getVelocity();

                for (let x = -acc; x <= acc; x++) {
                    for (let y = -acc; y <= acc; y++) {
                        let offset = new Vector2(x, y);

                        let move = {
                            Offset: offset,
                            Active: (velocity.add(offset)).mag() < velocity.mag()
                        };

                        moves.push(move);
                    }
                }

            } else if (type == MATERIAL_INFO.Water.Name) {
                for (let x = -acc; x <= acc; x++) {
                    for (let y = -acc; y <= acc; y++) {
                        let move = {
                            Offset: new Vector2(x, y),
                            Active: (x == 0 && y == 0)
                        };

                        moves.push(move);
                    }
                }

            } else if (type == MATERIAL_INFO.Booster.Name) {
                let velocity = racecar.getVelocity();

                let X = Math.sign(velocity.x());
                let Y = Math.sign(velocity.y());

                for (let x = -acc; x <= acc; x++) {
                    for (let y = -acc; y <= acc; y++) {
                        let move = {
                            Offset: new Vector2(X + x, Y + y),
                            Active: true
                        };

                        moves.push(move);
                    }
                }

            } else {
                throw new Error(`[RaceInstance] "${type}" is an unrecognised material`);
            }

        // not on any material - use normal moveset
        } else {
            for (let x = -acc; x <= acc; x++) {
                for (let y = -acc; y <= acc; y++) {
                    let move = {
                        Offset: new Vector2(x, y),
                        Active: true
                    };

                    moves.push(move);
                }
            }
        }

        return moves;
    }
}