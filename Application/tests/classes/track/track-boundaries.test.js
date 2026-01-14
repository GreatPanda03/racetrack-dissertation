import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode, Track, TrackForm, TrackBoundaries
} from "../../../src/core";


describe("classes.track-boundaries.new", () => {
    it("creates a new TrackBoundaries instance with default values (empty path)", () => {
        let track = new Track();
        
        let boundaries = new TrackBoundaries(track);

        expect( boundaries instanceof TrackForm ).toBe( true );
        expect( boundaries.getTrack() ).toBe( track );
        expect( boundaries.getLeftSide().length ).toEqual( 0 );
        expect( boundaries.getRightSide().length ).toEqual( 0 );
        expect( boundaries.getBoundaries().length ).toEqual( 0 );
    });

    it("creates a new TrackBoundaries instance with default values (path)", () => {
        let track = new Track();

        track.setPath([
            new TrackNode(new Vector2(0, 50), 25, false),
            new TrackNode(new Vector2(0, 0), 25, false),
            new TrackNode(new Vector2(0, -50), 25, false)
        ]);

        let boundaries = new TrackBoundaries(track);

        expect( boundaries.getTrack() ).toBe( track );
        expect( boundaries.getLeftSide().length ).toBe( 3 );
        expect( boundaries.getRightSide().length ).toBe( 3 );

        // assuming a looped track...
        // * 1 / res = "divisions" from one node to the next
        // * x2 for both sides of the track
        // * xN for the number of nodes in the track
        expect( boundaries.getBoundaries().length ).toBe( (1 / 0.1) * 2 * 3 );
    });

    it("throws an error if no valid Track is given", () => {
        expect( () => new TrackBoundaries() ).toThrowError();
        expect( () => new TrackBoundaries("a") ).toThrowError();
        expect( () => new TrackBoundaries(new TrackNode()) ).toThrowError();
    });
});

describe("classes.track-boundaries.doLinesIntersect", () => {
    it("finds an intersection between intersecting lines", () => {
        expect( TrackBoundaries.doLinesIntersect(   // angled lines
            new Vector2(5, 3), new Vector2(-1, 2),
            new Vector2(4, 2), new Vector2(0, 6)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect( // perpendicular lines
            new Vector2(-6, 6), new Vector2(-6, -6),
            new Vector2(-8, 0), new Vector2(-4, 0)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect( // lines touching at their ends
            new Vector2(5, 0), new Vector2(5, -5),
            new Vector2(5, 0), new Vector2(10, -5)) 
        ).toBe( true );
    });

    it("finds no intersection between non-intersecting lines", () => {
         expect( TrackBoundaries.doLinesIntersect(  // angled non-intersecting lines
            new Vector2(5, 1), new Vector2(-1, 2),
            new Vector2(4, 2), new Vector2(0, 6)) 
        ).toBe( false );

        expect( TrackBoundaries.doLinesIntersect( // perpendicular non-intersecting lines
            new Vector2(-6, 6), new Vector2(-6, -6),
            new Vector2(-8, 0), new Vector2(-6.5, 0)) 
        ).toBe( false );

        expect( TrackBoundaries.doLinesIntersect( // angled non-intersecting lines
            new Vector2(5, 0), new Vector2(5, -5),
            new Vector2(6, 0), new Vector2(11, -5)) 
        ).toBe( false );
    });

    it("finds an intersection between partially overlapping collinear lines", () => {
         expect( TrackBoundaries.doLinesIntersect(  // overlapping lines
            new Vector2(-1, -2), new Vector2(1, 2),
            new Vector2(0.5, 1), new Vector2(1.5, 3)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect( // one line containing another
            new Vector2(-5, -6), new Vector2(2, -6),
            new Vector2(-4, -6), new Vector2(-1, -6)) 
        ).toBe( true );
    });

    it("finds no intersection between non-overlapping collinear lines", () => {
        expect( TrackBoundaries.doLinesIntersect(  // overlapping lines
            new Vector2(-1, -2), new Vector2(1, 2),
            new Vector2(1.5, 3), new Vector2(2.5, 5)) 
        ).toBe( false );

        expect( TrackBoundaries.doLinesIntersect( // one line containing another
            new Vector2(-5, -6), new Vector2(2, -6),
            new Vector2(-10, -6), new Vector2(-8, -6)) 
        ).toBe( false );
    });

    it("finds an intersection between two identical lines", () => {
        expect( TrackBoundaries.doLinesIntersect(
            new Vector2(-1, -2), new Vector2(1, 2),
            new Vector2(-1, -2), new Vector2(1, 2)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect(
            new Vector2(-5, -6), new Vector2(2, -6),
            new Vector2(-5, -6), new Vector2(2, -6)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect(
            new Vector2(-5, -6), new Vector2(2, -6),
            new Vector2(-5, -6), new Vector2(2, -6)) 
        ).toBe( true );
    });

    it("finds no intersection between non-intersecting parallel lines", () => {
        expect( TrackBoundaries.doLinesIntersect( // angled parallel lines
            new Vector2(-1, -1), new Vector2(5, 3),
            new Vector2(0, -1), new Vector2(6, 3)) 
        ).toBe( false );

        expect( TrackBoundaries.doLinesIntersect( // vertical parallel lines
            new Vector2(-10, 1), new Vector2(-5, 1),
            new Vector2(-10, -1), new Vector2(-5, -1)) 
        ).toBe( false );

        expect( TrackBoundaries.doLinesIntersect( // horizontal parallel lines
            new Vector2(2, 2), new Vector2(2, 5),
            new Vector2(3, 3), new Vector2(3, -3)) 
        ).toBe( false );
    });

    it("finds an intersection between a point on a line", () => {
        expect( TrackBoundaries.doLinesIntersect( // "line point" on the "left" of the line
            new Vector2(-1, -1), new Vector2(5, 3),
            new Vector2(-1, -1), new Vector2(-1, -1)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect( // "line point" in the middle of the line
            new Vector2(-1, -1), new Vector2(5, 3),
            new Vector2(2, 1), new Vector2(2, 1)) 
        ).toBe( true );

        expect( TrackBoundaries.doLinesIntersect( // "line point" on the "right" of the line
            new Vector2(-1, -1), new Vector2(5, 3),
            new Vector2(5, 3), new Vector2(5, 3)) 
        ).toBe( true );
    });
});