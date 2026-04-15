import { describe, it, expect } from "vitest";

import {
    Vector2, Line
} from "../../../src/core";


describe("classes.line.new", () => {
    it("creates a new line out of the two given Vector2 values", () => {
        let line = new Line(new Vector2(5, -3), new Vector2(-4.5, 2.75));

        expect( line.start.x ).toBe( 5 );
        expect( line.start.y ).toBe( -3 );

        expect( line.end.x ).toBe( -4.5 );
        expect( line.end.y ).toBe( 2.75 );
    });

    it("throws an error if no Vector2 start or end is provided", () => {
        expect( () => new Line(null, new Vector2()) ).toThrowError();
        expect( () => new Line("a", new Vector2()) ).toThrowError();
        expect( () => new Line(new Object(), new Vector2()) ).toThrowError();

        expect( () => new Line(new Vector2(), null) ).toThrowError();
        expect( () => new Line(new Vector2(), "a") ).toThrowError();
        expect( () => new Line(new Vector2(), new Object()) ).toThrowError();
    })
})

describe("classes.line.getIntersection", () => {
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

describe("classes.line.getIntersection (static)", () => {
    // simply calls A.getIntersection(B);

    it("throws an error if no Line values are provided", () => {
        let line = new Line(new Vector2(), new Vector2());

        expect( () => Line.getIntersection( null, line ) ).toThrowError();
        expect( () => Line.getIntersection( "a", line ) ).toThrowError();
        expect( () => Line.getIntersection( new Object(), line ) ).toThrowError();

        expect( () => Line.getIntersection( line, null ) ).toThrowError();
        expect( () => Line.getIntersection( line, "a" ) ).toThrowError();
        expect( () => Line.getIntersection( line, new Object() ) ).toThrowError();
    });
});

describe("classes.line.containsPoint", () => {
    it("returns true when a point is on a line", () => {
        let line = new Line( new Vector2(-1, -1), new Vector2(5, 3) );

        // line points on the left edge, middle, and right edge
        let result1 = line.containsPoint(new Vector2(-1, -1));
        let result2 = line.containsPoint(new Vector2(2, 1));
        let result3 = line.containsPoint(new Vector2(5, 3));

        expect( result1 ).toBe( true );
        expect( result2 ).toBe( true );
        expect( result3 ).toBe( true );
    });

    it("returns false when a point is not on a line", () => {
        let line = new Line( new Vector2(-1, -1), new Vector2(5, 3) );

        // line points on the left edge, middle, and right edge
        let result1 = line.containsPoint(new Vector2(0, -1));
        let result2 = line.containsPoint(new Vector2(3, 1));
        let result3 = line.containsPoint(new Vector2(11, 7));

        expect( result1 ).toBe( false );
        expect( result2 ).toBe( false );
        expect( result3 ).toBe( false );
    });

    it("throws an error if no Vector2 is provided as a point", () => {
        let line = new Line(new Vector2(), new Vector2());

        expect( () => line.containsPoint(null) ).toThrowError();
        expect( () => line.containsPoint("a") ).toThrowError();
        expect( () => line.containsPoint(new Object()) ).toThrowError();
    });
});

describe("classes.line.toPoint", () => {
    it("calculates the shortest distance from a line to a point within its range", () => {
        let line = new Line( new Vector2(-1, -1), new Vector2(5, 3) );
        let point = new Vector2(2, 3);
        
        let distance = line.toPoint(point);

        expect( distance ).toBeCloseTo(1.66410058868, 5);
    });

    it("calculates the shortest distance from a line to a point beyond its range", () => {
        let line = new Line( new Vector2(4, -1), new Vector2(2, 3) );
        let point = new Vector2(4, 5);
        
        let distance = line.toPoint(point);

        expect( distance ).toBeCloseTo(2.82842712475, 5);
    });

    it("throws an error if no valid point is given", () => {
        let line = new Line( new Vector2(4, -1), new Vector2(2, 3) );

        expect( () => line.toPoint(null) ).toThrowError();
        expect( () => line.toPoint("a") ).toThrowError();
        expect( () => line.toPoint(new Object()) ).toThrowError();
    });
});

describe("classes.line (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Line( new Vector2(-1, -1), new Vector2(5, 3) );

        expect(() => {
            Line.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});