import { describe, it, expect } from "vitest";

import {
    Vector2, PathNode,
    TrackNode, Obstacle, Material,
    Track, TrackForm,
    RaceCar, RaceStats, RaceInstance,
    RACECAR_STATE,
    MATERIAL_INFO
} from "../../../src/core";


/* NOTE:
 * - most of the tests involve unlooped tracks, since those are easier to
 *     prepare and test
 * - looped tracks have been tested by eye and seem to work
 * - they also follow the same checkpoint / boundary / finish rules anyway
 * - the only real difference being in track boundaries (the endpoints)
 */


// auxiliary (used for "getPossibleMoves")
// * same as the ones in "material-info.test.js"
// * only really need to check for activity in this test suite
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
            console.log(activity[r][c]);

            return false;
        }
    }

    return true;
}


describe("classes.race-instance.new", () => {
    it("creates a new RaceInstance instance with default values", () => {
        let track = new Track();
        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        let instance = new RaceInstance(track);

        expect( instance.getTrack() ).toBe(track);
        expect( instance.getForm() instanceof TrackForm ).toBe(true);
        expect( instance.getRacecars() ).toEqual([]);
        expect( instance.getRaceStats() ).toEqual([]);
    });
});

describe("classes.race-instance.addRaceCar", () => {
    it("adds the given race car to the race instance", () => {
        let track = new Track();
        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);

        let racecars = instance.getRacecars();

        expect( racecars.includes(racecar) ).toBe(true);
    });

    it("throws an error when the race car is already in the race", () => {
        let track = new Track();
        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);

        expect( () => instance.addRacecar(racecar) ).toThrowError();
    });

    //throw an error for a race car that doesnt exist
});

describe("classes.race-instance.getRacecarStats", () => {
    it("returns the given racer's race stats", () => {
        let track = new Track()
        let instance = new RaceInstance(track);
        
        let racecar = new RaceCar();
        instance.addRacecar(racecar);

        let stats = instance.getRacecarStats(racecar);

        expect( stats instanceof RaceStats ).toBe(true);
    });

    it("throws an error if no valid RaceCar is given", () => {
        let track = new Track();
        let instance = new RaceInstance(track);

        expect( () => instance.addRacecar() ).toThrowError();
        expect( () => instance.addRacecar("a") ).toThrowError();
        expect( () => instance.addRacecar(new TrackNode()) ).toThrowError();
    });

    it("throws an error if the race car doesn't have stats", () => {
        let track = new Track();
        let instance = new RaceInstance(track);

        let racecar = new RaceCar();

        expect( () => instance.getRacecarStats(racecar) ).toThrowError();
    });
});

describe("classes.race-instance.isAnyRacecarInState", () => {
    it("returns whether any race car is in a race car state", () => {
        let track = new Track();
        
        track.setPath([
            new TrackNode(new Vector2(-20, 30), 50, false),
            new TrackNode(new Vector2(50, 63), 50, false),
            new TrackNode(new Vector2(-100, -100), 50, false)
        ]);

        let racecar1 = new RaceCar();
        let racecar2 = new RaceCar();
        let racecars = [racecar1, racecar2];

        let instance = new RaceInstance(track, racecars, 25);

        expect( instance.isAnyRacecarInState(RACECAR_STATE.Racing) ).toBe( true );
    })
});

describe("classes.race-instance.moveRacecarToStart", () => {
    it("positions all race cars at the starting line", () => {
        let track = new Track();
        
        track.setPath([
            new TrackNode(new Vector2(-20, 30), 50, false),
            new TrackNode(new Vector2(50, 63), 50, false),
            new TrackNode(new Vector2(-100, -100), 50, false)
        ]);

        let instance = new RaceInstance(track);
        instance.setSpacing(25);

        let racecar1 = new RaceCar();
        let racecar2 = new RaceCar();

        instance.moveRacecarToStart(racecar1);
        instance.moveRacecarToStart(racecar2);

        expect( racecar1.getPosition().x ).toBe( -1 );
        expect( racecar1.getPosition().y ).toBe( 1 );

        expect( racecar2.getPosition().x ).toBe( -1 );
        expect( racecar2.getPosition().y ).toBe( 1 );
    });
});


describe("classes.race-instance.getPossibleMoves", () => {
    it("returns all moves in the race car's acceleration range as available moves (at rest, unaffected)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("returns all moves in the race car's acceleration range as available moves (moving, unaffected)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0));

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("limits the race car's moves when at max velocity", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        racecar.setPosition(new Vector2(0, 0));
        racecar.setVelocity(new Vector2(-10, -10));

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [
            [0, 0, 0],
            [0, 1, 1],
            [0, 1, 1]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("affects the race car's moves when on top of a material", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        let curb = new Material([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ], MATERIAL_INFO.Curb.Name);

        track.addMaterial(curb);
        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // inside material

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("compounds the limits of the race car's max velocity and material", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        let curb = new Material([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ], MATERIAL_INFO.Curb.Name);

        track.addMaterial(curb);
        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(1, 1));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // inside material

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [ // note right column of 0s - limited velocity!
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });

    it("only considers the first material when the race car is on two overlapping materials", () => {
        // i.e. [Material1, Material2] <- only applies Material1's effects

        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        let curb = new Material([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ], MATERIAL_INFO.Curb.Name);

        let water = new Material([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ], MATERIAL_INFO.Water.Name);

        track.addMaterial(curb);
        track.addMaterial(water);
        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // inside material

        let moves = instance.getPossibleMoves(racecar);
        
        let activity = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]];

        expect( matchesActivity(moves, activity) ).toBe( true );
    });
});

describe("classes.predictMove", () => {
    it("predicts where the race car is going to go", () => {
        // already tested by "moveRacecar" (see tests below)
    })
})

describe("classes.race-instance.moveRaceCar (parameters)", () => {
    it("throws an error when the race car isn't a valid RaceCar", () => {
        let track = new Track();
        let instance = new RaceInstance(track);

        let move = new Vector2(1, 1);

        expect( () => instance.moveRacecar(null, move) ).toThrowError();
        expect( () => instance.moveRacecar("a", move) ).toThrowError();
        expect( () => instance.moveRacecar(new TrackNode(), move) ).toThrowError();
    });

    it("throws an error when the move isn't a valid Vector2", () => {
        let track = new Track();
        let instance = new RaceInstance(track);
        
        let racecar = new RaceCar();
        instance.addRacecar(racecar);

        expect( () => instance.moveRacecar(racecar, null) ).toThrowError();
        expect( () => instance.moveRacecar(racecar, "a") ).toThrowError();
        expect( () => instance.moveRacecar(racecar, new TrackNode()) ).toThrowError();
    });

    it("throws an error when the given race car has no stats to update", () => {
        let track = new Track();
        let instance = new RaceInstance(track);
        
        let racecar = new RaceCar();
        instance.addRacecar(racecar);

        let move = new Vector2(1, 1);

        expect( () => instance.moveRacecar(racecar, move) ).toThrowError();
    })
});

describe("classes.race-instance.moveRacecar (velocity)", () => {
    it("applies the given move as an acceleration to the given race car", () => {
        let track = new Track();
    
        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, false),
            new TrackNode(new Vector2(70, 0), 43, false)
        ]);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(10, 10));

        let instance = new RaceInstance(track, [racecar], 25);

        let move = new Vector2(0.25, 0.25);

        instance.moveRacecar(racecar, move);

        expect( racecar.getPosition().x ).toBe( -0.75 );
        expect( racecar.getPosition().y ).toBe( 2.25 );
    });
});

describe("classes.race-instance.moveRacecar (race path)", () => {
    it("adds the race car's new move to its path", () => {
        let track = new Track();
    
        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, false),
            new TrackNode(new Vector2(70, 0), 43, false)
        ]);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(10, 10));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(0.25, 0.25));

        let stats = instance.getRacecarStats(racecar);
        let moves = stats.getMoves();

        let path = moves[0].Path;

        expect( path.start.x ).toBe( -1 );
        expect( path.start.y ).toBe( 2 );

        expect( path.end.x ).toBe( -0.75 );
        expect( path.end.y ).toBe( 2.25 );
    });
});

describe("classes.race-instance.moveRacecar (checkpoint)", () => {
    it("marks a checkpoint as passed when crossed in order", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, true),
            new TrackNode(new Vector2(70, 0), 43, true)
        ]);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(10, 10));

        let instance = new RaceInstance(track, [racecar], 25);

        let move = new Vector2(0.5, -1.5);

        instance.moveRacecar(racecar, move);

        let stats = instance.getRacecarStats(racecar);
        let checkpoints = stats.getCheckpoints();

        expect( checkpoints[0].passed ).toBe( true );
    });

    it("does not mark a checkpoint as passed when crossed out of order", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-100, 0), 25, false),
            new TrackNode(new Vector2(-50, 0), 25, true),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true),
            new TrackNode(new Vector2(-100, 0), 25, false)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        racecar.setPosition(new Vector2(3, 0));

        instance.moveRacecar(racecar, new Vector2(-1, 0)); // acceleration
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));

        let stats = instance.getRacecarStats(racecar);

        expect( stats.getCheckpoints().some(c => c.passed) ).toBe( false );
    });

    it("marks only the earliest checkpoint when crossing several at once", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-100, 0), 25, false),
            new TrackNode(new Vector2(-50, 0), 25, true),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true),
            new TrackNode(new Vector2(-100, 0), 25, false)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(10, 10));

        let instance = new RaceInstance(track, [racecar], 25);

        racecar.setPosition(new Vector2(3, 0));

        instance.moveRacecar(racecar, new Vector2(-5, 0)); // acceleration

        let stats = instance.getRacecarStats(racecar);
        let checkpoints = stats.getCheckpoints();

        expect( checkpoints[2].passed ).toBe( false );
        expect( checkpoints[1].passed ).toBe( false );
        expect( checkpoints[0].passed ).toBe( true );
    });

    it("does not mark any checkpoint as passed when none are crossed", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, false),
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(0.5, 0)); // acceleration

        let stats = instance.getRacecarStats(racecar);
        let checkpoints = stats.getCheckpoints();

        expect( checkpoints[0].passed ).toBe( false );
    });
});

describe("classes.race-instance.moveRacecar (boundary collision)", () => {
    it("marks a race car as crashed when it goes off the track (looped)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, true),
            new TrackNode(new Vector2(70, 0), 43, true)
        ]);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0));
        instance.moveRacecar(racecar, new Vector2(1, 1));

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATE.Crashed );
    });

    it("marks a race car as crashed when it goes off the track (unlooped)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, false),
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // acceleration
        instance.moveRacecar(racecar, new Vector2(1, 1));
        instance.moveRacecar(racecar, new Vector2(0, 0));

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATE.Crashed );
    });

    it("marks a race car as crashed when it goes into an obstacle", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, false),
        ]);

        let obstacle = new Obstacle([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ]);

        track.addObstacle(obstacle);
        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // causes crash

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATE.Crashed );
    });

    it("records the end of the race car's path as being the crash point when crashing", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, false),
        ]);

        let obstacle = new Obstacle([
            new PathNode(new Vector2(-5, -50)),
            new PathNode(new Vector2( 5, -50)),
            new PathNode(new Vector2( 5,  50)),
            new PathNode(new Vector2(-5,  50))
        ]);

        track.addObstacle(obstacle);
        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // causes crash

        let stats = instance.getRacecarStats(racecar);
        let moves = stats.getMoves();
        let lastMove = moves[moves.length - 1].Path;

        expect( lastMove.start.x ).toBeCloseTo( -1 );
        expect( lastMove.start.y ).toBeCloseTo( 0 );

        expect( lastMove.end.x ).toBeCloseTo( -0.2 ); // left edge of obstacle
        expect( lastMove.end.y ).toBeCloseTo( 0 );
    });

    it("does not mark the race car as crashed when no boundaries are crossed (unlooped)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, false),
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));

        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(0.5, 0)); // acceleration

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATE.Racing );
    });
});

describe("classes.race-instance.moveRacecar (finish)", () => {
    it("marks a race car as finished when it crosses the finish line after crossing all checkpoints", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));
        
        let instance = new RaceInstance(track, [racecar], 25);

        // straight-line track (unlooped)
        // * starting from (-2, 0), ending at (2, 0)
        // * expected to take 4 moves travelling at (1, 0) m/s
        // * also accounts for checkpoint
        instance.moveRacecar(racecar, new Vector2(1, 0)); // acceleration
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATE.Finished );
    });

    it("records the end of the race car's path as being the finish point when finishing", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(35, 0), 25, true)
        ]);

        track.setLooped(false);

        let racecar = new RaceCar();
        racecar.setMaxSpeed(new Vector2(10, 10));
        racecar.setMaxAcceleration(new Vector2(1, 1));
        
        let instance = new RaceInstance(track, [racecar], 25);

        instance.moveRacecar(racecar, new Vector2(1, 0)); // acceleration
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));

        let stats = instance.getRacecarStats(racecar);
        let moves = stats.getMoves();
        let lastMove = moves[moves.length - 1].Path;

        expect( lastMove.start.x ).toBeCloseTo( 1 );
        expect( lastMove.start.y ).toBeCloseTo( 0 );

        expect( lastMove.end.x ).toBeCloseTo( 1.4 );
        expect( lastMove.end.y ).toBeCloseTo( 0 );
    });
});

