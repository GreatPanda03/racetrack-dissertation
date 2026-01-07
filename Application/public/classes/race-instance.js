// class to manage instance of RaceInstance objects
// * RaceInstance represents an active race session with details about 
//     racecars and the game state

// * source: "How to check if two given line segments intersect?", GeeksforGeeks, geeksforgeeks.org, [Online]. Accessed: Nov 29, 2025. Available at: https://www.geeksforgeeks.org/dsa/check-if-two-given-line-segments-intersect/
// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.




// [[ Imports ]] //
import Vector2 from "./vector2.js";
import TrackBoundaries from "./track-boundaries.js";
import RaceCar from "./racecar.js";
import RaceStats from "./race-stats.js";
import RACECAR_STATES from "../enums/racecar-states.js";


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
                stats.setState(RACECAR_STATES.Finished);
                return;
            }
        }

        // [source 2] collision detection
        // * check for crashes last, in case crossing the finish line

        // originally used the commented section [source 2]
        // * won't work if a car "jumps over" a wall and lands on the track again
        // * the current version is more reliable and works for those cases
        // * will still have to use [source 2] for materials, obstacles, etc.
        //     so bring it back for that

        for (let boundary of boundaries.getBoundaries()) {
            let crossed = TrackBoundaries.doLinesIntersect(oldPos, newPos, boundary[0], boundary[1]);
            if (crossed) stats.setState(RACECAR_STATES.Crashed);
        }

        // * TODO: repurpose this code for materials
        // * TODO: just add obstacle polygon sides as boundary lines

        /*
        let ray = new Vector2(10000, 0);
        let crosses = 0;

        for (let boundary of boundaries.getBoundaries()) {
            let crossed = TrackBoundaries.doLinesIntersect(newPos, ray, boundary[0], boundary[1]);
            if (crossed) crosses += 1;
        }

        if (crosses % 2 == 0) {
            stats.setState(RACECAR_STATES.Crashed);
            return;
        }
        */

        // TODO: if the finished line is crossed, adjust time accordingly
    }
}