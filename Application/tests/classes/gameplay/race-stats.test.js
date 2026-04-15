import { describe, it, expect } from "vitest";

import {
    Vector2, Line,
    TrackNode, Track,
    RaceCar, RaceStats,
    RACECAR_STATE
} from "../../../src/core";


describe("classes.race-stats.new", () => {
    it("creates a new RaceStats instance with default values", () => {
        let track = new Track();
        let racecar = new RaceCar();
        let stats = new RaceStats(track, racecar);

        expect( stats.getTrack() ).toBe( track );
        expect( stats.getRacecar() ).toBe( racecar );
        expect( stats.getMoves().length ).toBe( 0 );
        expect( stats.getDistance() ).toBe( 0 );
        expect( stats.getTime() ).toBe( 0 );
        expect( stats.getTopSpeed() ).toBe( 0 );
        expect( stats.getCheckpoints().length ).toBe( 0 );
        expect( stats.getState() ).toBe( RACECAR_STATE.Racing );
    });

    it("does not include the first node as a checkpoint, regardless of its mark", () => {
        let track = new Track();
        let racecar = new RaceCar();

        let first = new TrackNode(new Vector2(), 25, true);
        let second = new TrackNode(new Vector2(), 25, true);

        track.setPath([first, second]);

        let stats = new RaceStats(track, racecar);
        let index = stats.getCheckpoints()[0].index;

        expect( index ).toBe( 1 ); // corresponds to "second"
        expect( stats.getCheckpoints().length ).toBe( 1 );
    })

    it("throws an error if no Track is provided", () => {
        expect( () => new RaceStats() ).toThrowError();
        expect( () => new RaceStats("a") ).toThrowError();
        expect( () => new RaceStats(new TrackNode()) ).toThrowError();
    });
});

describe("classes.race-stats.addMove", () => {
    it("adds the given path and velocity as a move", () => {
        let track = new Track();
        let racecar = new RaceCar();
        let stats = new RaceStats(track, racecar);

        let path = new Line( new Vector2(3, -2), new Vector2(-5, 3) );
        let velocity = new Vector2();

        stats.addMove(path, velocity);

        expect( stats.getMoves().length ).toBe( 1 );
        expect( stats.getMoves()[0].Path ).toBe( path );
        expect( stats.getMoves()[0].Velocity ).toBe( velocity );
    });

    it("throws an error when the given path isn't a Line", () => {
        let track = new Track();
        let racecar = new RaceCar();
        let stats = new RaceStats(track, racecar);

        let velocity = new Vector2();

        expect( () => stats.addMove(null, velocity) ).toThrowError();
        expect( () => stats.addMove("a", velocity) ).toThrowError();
        expect( () => stats.addMove(new TrackNode(), velocity) ).toThrowError();
    });

    it("throws an error when the given velocity isn't a Vector2", () => {
        let track = new Track();
        let racecar = new RaceCar();
        let stats = new RaceStats(track, racecar);

        let line = new Line(new Vector2(), new Vector2());

        expect( () => stats.addMove(line, null) ).toThrowError();
        expect( () => stats.addMove(line, "a") ).toThrowError();
        expect( () => stats.addMove(line, new TrackNode()) ).toThrowError();
    });
});

describe("classes.race-stats.calculateStats", () => {
    it("calculates all stats based on the path", () => {
        let track = new Track();
        let racecar = new RaceCar();
        let stats = new RaceStats(track, racecar);

        let line1 = new Line( new Vector2(0, 0), new Vector2(1, 2) );
        let line2 = new Line( new Vector2(1, 2), new Vector2(3, 1) );
        let line3 = new Line( new Vector2(3, 1), new Vector2(2, 5) );
        let line4 = new Line( new Vector2(2, 5), new Vector2(3, 6) );
        let line5 = new Line( new Vector2(3, 6), new Vector2(5, 10) );

        // technically recalculates / adjusts stats each add...
        stats.addMove(line1, new Vector2(1, 2));
        stats.addMove(line2, new Vector2(2, -1));
        stats.addMove(line3, new Vector2(-1, 4));
        stats.addMove(line4, new Vector2(1, 1));
        stats.addMove(line5, new Vector2(2, 4));

        // ... but checking this produces the same result
        stats.calculateStats();

        expect( stats.getMoves().length ).toBe( 5 );
        expect( stats.getDistance() ).toBeCloseTo( 14.481591098 );
        expect( stats.getTime() ).toBe( 5 );
        expect( stats.getTopSpeed() ).toBeCloseTo( 4.472135955 );
    });
});