import { describe, it, expect } from "vitest";

import {
    Vector2, Line
} from "../../../src/core";


describe("classes.track-boundaries.getIntersection", () => {
    it("returns the intersection between intersecting lines", () => {
        let point1 = Line.getIntersection( // angled lines
            new Line( new Vector2(5, 3), new Vector2(-1, 2) ),
            new Line( new Vector2(4, 2), new Vector2(0, 6)) );
            
        let point2 = Line.getIntersection( // perpendicular lines
            new Line( new Vector2(-6, 6), new Vector2(-6, -6) ),
            new Line( new Vector2(-8, 0), new Vector2(-4, 0) ));

        let point3 = Line.getIntersection( // lines touching at their ends
            new Line( new Vector2(5, 0), new Vector2(5, -5) ),
            new Line( new Vector2(5, 0), new Vector2(10, -5) ));

        expect( point1.x ).toBeCloseTo( 3.28571429 );
        expect( point1.y ).toBeCloseTo( 2.71428571 );

        expect( point2.x ).toBeCloseTo( -6 );
        expect( point2.y ).toBeCloseTo( 0 );

        expect( point3.x ).toBeCloseTo( 5 );
        expect( point3.y ).toBeCloseTo( 0 );
    });

    it("returns no intersection between non-intersecting lines", () => {
        let point1 = Line.getIntersection( // angled non-intersecting lines
            new Line( new Vector2(5, 1), new Vector2(-1, 2) ),
            new Line( new Vector2(4, 2), new Vector2(0, 6) ));

        let point2 = Line.getIntersection( // perpendicular non-intersecting lines
            new Line( new Vector2(-6, 6), new Vector2(-6, -6) ),
            new Line( new Vector2(-8, 0), new Vector2(-6.5, 0) ));

        let point3 = Line.getIntersection( // angled non-intersecting lines
            new Line( new Vector2(5, 0), new Vector2(5, -5) ),
            new Line( new Vector2(6, 0), new Vector2(11, -5) ));

        expect( point1 ).toBe( null );
        expect( point2 ).toBe( null );
        expect( point3 ).toBe( null );
    });

    it("returns the first point of contact between partially overlapping collinear lines", () => {
        let point1 = Line.getIntersection( // overlapping lines
            new Line( new Vector2(-1, -2), new Vector2(1, 2) ),
            new Line( new Vector2(0.5, 1), new Vector2(1.5, 3) ));

        let point2 = Line.getIntersection( // one line containing another
            new Line( new Vector2(-5, -6), new Vector2(2, -6) ),
            new Line( new Vector2(-4, -6), new Vector2(-1, -6) ));

        expect( point1.x ).toBe( 0.5 );
        expect( point1.y ).toBe( 1 );

        expect( point2.x ).toBe( -4 );
        expect( point2.y ).toBe( -6 );
    });

    it("returns no intersection between non-overlapping collinear lines", () => {
        let point1 = Line.getIntersection( // overlapping lines
            new Line( new Vector2(-1, -2), new Vector2(1, 2) ),
            new Line( new Vector2(1.5, 3), new Vector2(2.5, 5) ));

        let point2 = Line.getIntersection( // one line containing another
            new Line( new Vector2(-5, -6), new Vector2(2, -6) ),
            new Line( new Vector2(-10, -6), new Vector2(-8, -6) ));

        expect( point1 ).toBe( null );
        expect( point1 ).toBe( null );
        
        expect( point2 ).toBe( null );
        expect( point2 ).toBe( null );
    });

    it("returns the first point of contact between two identical lines", () => {
        let point1 = Line.getIntersection(
            new Line( new Vector2(-1, -2), new Vector2(1, 2) ),
            new Line( new Vector2(-1, -2), new Vector2(1, 2) ));

        let point2 = Line.getIntersection(
            new Line( new Vector2(-5, -6), new Vector2(2, -6) ),
            new Line( new Vector2(-5, -6), new Vector2(2, -6) ));

        let point3 = Line.getIntersection(
            new Line( new Vector2(3.5, 4.5), new Vector2(2, 3) ),
            new Line( new Vector2(2, 3), new Vector2(3.5, 4.5) ));

        expect( point1.x ).toBe( -1 );
        expect( point1.y ).toBe( -2 );
        
        expect( point2.x ).toBe( -5 );
        expect( point2.y ).toBe( -6 );

        expect( point3.x ).toBe( 3.5 );
        expect( point3.y ).toBe( 4.5 );
    });

    it("returns no intersection between non-intersecting parallel lines", () => {
        let point1 = Line.getIntersection( // angled parallel lines
            new Line( new Vector2(-1, -1), new Vector2(5, 3) ),
            new Line( new Vector2(0, -1), new Vector2(6, 3) ));

        let point2 = Line.getIntersection( // vertical parallel lines
            new Line( new Vector2(-10, 1), new Vector2(-5, 1) ),
            new Line( new Vector2(-10, -1), new Vector2(-5, -1) ));

        let point3 = Line.getIntersection( // horizontal parallel lines
            new Line( new Vector2(2, 2), new Vector2(2, 5) ),
            new Line( new Vector2(3, 3), new Vector2(3, -3) ));

        expect( point1 ).toBe( null );
        expect( point2 ).toBe( null );
        expect( point3 ).toBe( null );
    });
});

describe("classes.track-boundaries.containsPoint", () => {
    it("returns whether a point is on a line", () => {
        let line1 = new Line( new Vector2(-1, -1), new Vector2(5, 3) );
        let line2 = new Line( new Vector2(-1, -1), new Vector2(5, 3) );
        let line3 = new Line( new Vector2(-1, -1), new Vector2(5, 3) );

        // line points on the left edge, middle, and right edge
        let result1 = line1.containsPoint(new Vector2(-1, -1));
        let result2 = line2.containsPoint(new Vector2(2, 1));
        let result3 = line3.containsPoint(new Vector2(5, 3));

        expect( result1 ).toBe( true );
        expect( result2 ).toBe( true );
        expect( result3 ).toBe( true );
    });
});