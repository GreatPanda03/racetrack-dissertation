import { describe, it, expect } from "vitest";

import {
    Vector2,
    RaceCar,
    MATERIAL_INFO
} from "../../functions/src/core";


/* NOTE:
 * - this suite assures materials restrict movement accordingly
 * - each test gathers moves (according to race instance methodology)
 * - they also have a 2D mapping showing which moves are expected to be available
 * - to match the 2D mapping, moves in this suite are also mapped in an equal
 *     2D array (while race instance moves being in a 1D array)
 */

// NOTE 2:
// * not entirely sure why, but Y values are flipped for mappings...
//     still trying to figure out how to flip them but that seems like
//     "cheesing" the tests

// tests still a WIP


// auxiliary
function gatherMoves(racecar, Effect) {
    let acc = Math.abs(racecar.getMaxAcceleration().x);
    let moves = [];

    for (let x = -acc; x <= acc; x++) {
        for (let y = -acc; y <= acc; y++) {
            moves.push( Effect(racecar, x, y) );
        }
    }

    return moves;
}

function matchesActivity(moves, activity) {
    let xMin = moves[0].Offset.x;
    let yMin = moves[0].Offset.y;

    for (let move of moves) {
        let offset = move.Offset;
        let r = offset.y - yMin;
        let c = offset.x - xMin;

        if (move.Active != activity[r][c]) {
            console.log(move.Offset.toObject());
            console.log(move.Active);
            console.log(r, c);
            console.log(activity);
            console.log(activity[r][c]);

            return false;
        }
    }

    return true;
}

function matchesOffsets(moves, offsets) {
    let xMin = moves[0].Offset.x;
    let yMin = moves[0].Offset.y;

    for (let move of moves) {
        let offset = move.Offset;
        let r = offset.y - yMin;
        let c = offset.x - xMin;

        if (   move.Offset.x != offsets[r][c].x
            || move.Offset.y != offsets[r][c].y)
        {
            console.log(move.Offset.toObject());
            console.log(move.Active);
            console.log(r, c);
            console.log(offsets[r][c].toObject());

            return false;
        }
    }

    return true;
}


// like a 45 degree diamond (x + y = max acceleration)
describe("enums.material-info (Curb)", () => {
    it("gathers the correct available / unavailable moves (small scale)", () => {
        let racecar = new RaceCar();
        let acc = 1;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]];

        let moves = gatherMoves(racecar, MATERIAL_INFO.Curb.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("gathers the correct available / unavailable moves (large scale)", () => {
        let racecar = new RaceCar();
        let acc = 4;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 0, 0, 0, 1, 0, 0, 0, 0],  // -4
            [0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],  //  0
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0]]; // +4

        let moves = gatherMoves(racecar, MATERIAL_INFO.Curb.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });
});

// reduces race car's selection choices by 1 unit in their direction of travel
describe("enums.material-info (Gravel)", () => {
    it("gathers the correct available / unavailable moves (small scale)", () => {
        let racecar = new RaceCar();
        let acc = 1;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 0, 0],
            [1, 0, 0],
            [1, 1, 0]];

        let moves = gatherMoves(racecar, MATERIAL_INFO.Gravel.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("gathers the correct available / unavailable moves (large scale)", () => {
        let racecar = new RaceCar();
        let acc = 4;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],   // -4
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 0, 0, 0, 0, 0],  //  0
            [1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 0, 0, 0, 0, 0]]; // +4

        let moves = gatherMoves(racecar, MATERIAL_INFO.Gravel.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });
});

// forces the race car to travel at the same velocity
describe("enums.material-info (Water)", () => {
    it("gathers the correct available / unavailable moves (small scale)", () => {
        let racecar = new RaceCar();
        let acc = 1;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]];

        let moves = gatherMoves(racecar, MATERIAL_INFO.Water.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("gathers the correct available / unavailable moves (large scale)", () => {
        let racecar = new RaceCar();
        let acc = 4;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],  // -4
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0],  //  0
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]; // +4

        let moves = gatherMoves(racecar, MATERIAL_INFO.Water.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("acts like Curb when speed is <= 1", () => {
        let racecar = new RaceCar();
        let acc = 1;

        racecar.setVelocity(new Vector2(0, 0));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]];

        let moves = gatherMoves(racecar, MATERIAL_INFO.Water.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
    });
});

// 
describe("enums.material-info (Booster)", () => {
    it("gathers the correct available / unavailable moves and offsets (small scale)", () => {
        let racecar = new RaceCar();
        let acc = 1;

        racecar.setVelocity(new Vector2(3, -2));
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(-acc, acc));

        let activity = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]];

        let offsets = [
            [new Vector2(0, -2), new Vector2(1, -2), new Vector2(2, -2)],
            [new Vector2(0, -1), new Vector2(1, -1), new Vector2(2, -1)],
            [new Vector2(0,  0), new Vector2(1,  0), new Vector2(2,  0)]];

        let moves = gatherMoves(racecar, MATERIAL_INFO.Booster.Effect);

        expect( matchesActivity(moves, activity) ).toBe( true );
        expect( matchesOffsets(moves, offsets) ).toBe( true );
    });

    it("gathers the correct available / unavailable moves (large scale)", () => {

    });
});