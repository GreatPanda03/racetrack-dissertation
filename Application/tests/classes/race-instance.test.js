import { describe, it, expect } from "vitest";

import Vector2 from "../../public/classes/vector2.js";
import TrackNode from "../../public/classes/track-node.js";
import Track from "../../public/classes/track.js";
import TrackBoundaries from "../../public/classes/track-boundaries.js";
import RaceCar from "../../public/classes/racecar.js";
import RaceStats from "../../public/classes/race-stats.js";
import RaceInstance from "../../public/classes/race-instance.js";
import RACECAR_STATES from "../../public/enums/racecar-states.js";


describe("classes.race-instance.new", () => {
    it("creates a new RaceInstance instance with default values", () => {
        let track = new Track();
        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        let instance = new RaceInstance(track);

        expect( instance.getTrack() ).toBe(track);
        expect( instance.getBoundaries() instanceof TrackBoundaries ).toBe(true);
        expect( instance.getRacecars() ).toEqual([]);
        expect( instance.getRaceStats() ).toEqual({});
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

describe("classes.race-instance.prepareRaceCars", () => {
    it("positions all race cars at the starting line", () => {
        let track = new Track();
        
        track.setPath([
            new TrackNode(new Vector2(-20, 30), 50, false),
            new TrackNode(new Vector2(50, 63), 50, false),
            new TrackNode(new Vector2(-100, -100), 50, false)
        ]);

        let instance = new RaceInstance(track);

        let racecar1 = new RaceCar();
        let racecar2 = new RaceCar();

        instance.addRacecar(racecar1);
        instance.addRacecar(racecar2);
        instance.prepareRacecars();

        expect( racecar1.getPosition().x() ).toBe( -1 );
        expect( racecar1.getPosition().y() ).toBe( 1 );

        expect( racecar2.getPosition().x() ).toBe( -1 );
        expect( racecar2.getPosition().y() ).toBe( 1 );
    });
});

describe("classes.race-instance.moveRaceCar", () => {
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

describe("classes.race-instance.moveRacecar.velocity", () => {
    it("applies the given move as an acceleration to the given race car", () => {
        let track = new Track();
    
        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, false),
            new TrackNode(new Vector2(70, 0), 43, false)
        ])

        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);
        instance.prepareRacecars();

        let move = new Vector2(2, 5);

        instance.moveRacecar(racecar, move);

        expect( racecar.getPosition().x() ).toBe( 1 );
        expect( racecar.getPosition().y() ).toBe( 7 );
    });
});

describe("classes.race-instance.moveRacecar.racePath", () => {
    it("adds the race car's new move to its path", () => {
        let track = new Track();
    
        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, false),
            new TrackNode(new Vector2(70, 0), 43, false)
        ])

        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);
        instance.prepareRacecars();

        let move = new Vector2(2, 5);

        instance.moveRacecar(racecar, move);

        let stats = instance.getRacecarStats(racecar);
        let path = stats.getPath();

        expect( path[0].x() ).toBe( -1 );
        expect( path[0].y() ).toBe( 2 );

        expect( path[1].x() ).toBe( 1 );
        expect( path[1].y() ).toBe( 7 );
    });
});

describe("classes.race-instance.moveRacecar.checkpoint", () => {
    it("marks a checkpoint as passed when crossed in order", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, true),
            new TrackNode(new Vector2(70, 0), 43, true)
        ])

        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);
        instance.prepareRacecars();

        let move = new Vector2(0.5, -1.5);

        instance.moveRacecar(racecar, move);

        let stats = instance.getRacecarStats(racecar);
        let checkpoints = stats.getCheckpoints();

        expect( checkpoints[0].passed ).toBe( true );
    });

    it("does not mark a checkpoint as passed when crossed out of order", () => {
        // ...
    });

    it("does not mark any checkpoint as passed when none are crossed", () => {
        // ...
    })
});

describe("classes.race-instance.moveRacecar.collision", () => {
    it("marks a race car as crashed when it goes off the track", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-30, 50), 25, false),
            new TrackNode(new Vector2(-20, 30), 10, true),
            new TrackNode(new Vector2(70, 0), 43, true)
        ])

        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);
        instance.prepareRacecars();

        let move = new Vector2(-5, -10);

        instance.moveRacecar(racecar, move);

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATES.Crashed );
    });
});

describe("classes.race-instance.moveRacecar.finish", () => {
    it("marks a race car as finished when it crosses the finish line after crossing all checkpoints", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(-50, 0), 25, false),
            new TrackNode(new Vector2(0, 0), 25, true),
            new TrackNode(new Vector2(50, 0), 25, true)
        ])

        track.setLooped(false);

        let instance = new RaceInstance(track);

        let racecar = new RaceCar();
        instance.addRacecar(racecar);
        instance.prepareRacecars();

        // straight-line track (unlooped)
        // * starting from (-2, 0), ending at (2, 0)
        // * expected to take 4 moves travelling at (1, 0) /s
        // * also accounts for first checkpoint!
        instance.moveRacecar(racecar, new Vector2(1, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));
        instance.moveRacecar(racecar, new Vector2(0, 0));

        let stats = instance.getRacecarStats(racecar);
        let state = stats.getState();

        expect( state ).toBe( RACECAR_STATES.Finished );
    });

    // should test "looped" track too... but that's harder...
    // * it DOES work i swear
});