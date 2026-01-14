import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode, Track,
    RaceStats,
    RACECAR_STATE
} from "../../../src/core";


describe("classes.race-stats.new", () => {
    it("creates a new RaceStats instance with default values", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        expect( stats.getTrack() ).toBe( track );
        expect( stats.getPath() ).toEqual( [] );
        expect( stats.getDistance() ).toBe( 0 );
        expect( stats.getTime() ).toBe( 0 );
        expect( stats.getTopSpeed() ).toBe( 0 );
        expect( stats.getCheckpoints() ).toEqual( [] );
        expect( stats.getState() ).toBe( RACECAR_STATE.Racing );
    });

    it("does not include the first node as a checkpoint, regardless of its mark", () => {
        let track = new Track();

        let first = new TrackNode(new Vector2(), 25, true);
        let second = new TrackNode(new Vector2(), 25, true);

        track.setPath([first, second]);

        let stats = new RaceStats(track);
        let target = stats.getCheckpoints()[0].node
        let index = track.getNodeIndex(target);

        expect( index ).toStrictEqual( 1 ); // corresponds to "second"
        expect( stats.getCheckpoints().length ).toBe( 1 );
    })

    it("throws an error if no Track is provided", () => {
        expect( () => new RaceStats() ).toThrowError();
        expect( () => new RaceStats("a") ).toThrowError();
        expect( () => new RaceStats(new TrackNode()) ).toThrowError();
    });
});

describe("classes.race-stats.addToPath", () => {
    it("adds the given point to the end of the path", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        stats.addToPath(new Vector2(-5, 3));

        let size = stats.getPath().length;

        expect( stats.getPath()[size - 1].x() ).toBe( -5 );
        expect( stats.getPath()[size - 1].y() ).toBe( 3 );
    });

    it("throws an error when the given point is not a Vector2", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        expect( () => stats.addToPath() ).toThrowError();
        expect( () => stats.addToPath("a") ).toThrowError();
        expect( () => stats.addToPath(new TrackNode()) ).toThrowError();
    })
});

describe("classes.race-stats.setCheckpointPassed", () => {
    it("marks the given checkpoint as passed", () => {
        let track = new Track();

        let target = new TrackNode(new Vector2(), 25, true);

        track.setPath([
            new TrackNode(new Vector2(), 25, false),
            target,
            new TrackNode(new Vector2(), 25, true),
        ]);

        let stats = new RaceStats(track);
        stats.setCheckpointPassed(target, true);

        expect( stats.isCheckpointPassed(target) ).toBe( true );
    });

    it("throws an error if the checkpoint isn't part of the track", () => {
        let track = new Track();

        let target = new TrackNode(new Vector2(), 25, true);
        
        let stats = new RaceStats(track);

        expect( () => stats.setCheckpointPassed(target, true) ).toThrowError();
    });

    it("throws an error if passed is not a boolean", () => {
        let track = new Track();

        let target = new TrackNode();
        
        let stats = new RaceStats(track);

        expect( () => stats.setCheckpointPassed(target, null) ).toThrowError();
        expect( () => stats.setCheckpointPassed(target, "a") ).toThrowError();
        expect( () => stats.setCheckpointPassed(target, new TrackNode()) ).toThrowError();
    })
});

describe("classes.race-stats.isCheckpointPassed", () => {
    // see "classes.race-stats.setCheckpointPassed"
    // * already validated there

    it("throws an error if the checkpoint isn't part of the track", () => {
        let track = new Track();

        let target = new TrackNode(new Vector2(), 25, true);

        track.setPath([
            new TrackNode(new Vector2(), 25, true),
            new TrackNode(new Vector2(), 25, true)
        ]);

        let stats = new RaceStats(track);

        expect( () => stats.isCheckpointPassed(target) ).toThrowError();
    });
});

describe("classes.race-stats.getMoves", () => {
    it("returns the number of moves in a path", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        stats.addToPath(new Vector2(0, 0));
        stats.addToPath(new Vector2(5, 3));
        stats.addToPath(new Vector2(10, 10));

        expect( stats.getMoves() ).toBe( 2 );
    });

    it("returns 0 moves when the path is empty", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        expect( stats.getMoves() ).toBe( 0 );
    });
})

describe("classes.race-stats.calculateStats", () => {
    it("calculates all stats based on the path", () => {
        let track = new Track();
        let stats = new RaceStats(track);

        // technically recalculates / adjusts stats each add...
        stats.addToPath(new Vector2(0, 0));
        stats.addToPath(new Vector2(1, 2));
        stats.addToPath(new Vector2(3, 1));
        stats.addToPath(new Vector2(2, 5));
        stats.addToPath(new Vector2(3, 6));
        stats.addToPath(new Vector2(5, 10));

        // ... but checking this produces the same result
        stats.calculateStats();

        expect( stats.getDistance() ).toBeCloseTo( 14.481591098 );
        expect( stats.getTime() ).toBe( 5 );
        expect( stats.getTopSpeed() ).toBeCloseTo( 4.472135955 );
    });
});