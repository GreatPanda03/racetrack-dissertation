import { describe, it, expect } from "vitest";

import { 
    Vector2, PathNode, Polygon
} from "../../../src/core";


describe("classes.polygon.new", () => {
    it("creates a new polygon with default values (empty)", () => {
        let polygon = new Polygon();

        expect( polygon.getPoints() ).toEqual( [] );
    });

    it("create a new polygon with points", () => {
        let points = [ new PathNode(), new PathNode(), new PathNode() ]
        let polygon = new Polygon(points);

        expect( polygon.getPoints() ).toEqual( points );
    });

    it("throws an error if an invalid PathNode is provided as a point", () => {
        let points = [ new PathNode(), "a", new PathNode() ];

        expect( () => new Polygon(points) ).toThrowError();
    });
});

describe("classes.polygon.addPoint", () => {
    it("adds a new point to the polygon", () => {
        let polygon = new Polygon();
        
        let A = new PathNode( new Vector2(1, 3) );
        let B = new PathNode( new Vector2(7, -2) );

        polygon.addPoint(B);
        polygon.addPoint(A);

        let points = polygon.getPoints();

        expect( points[0] ).toBe( B );
        expect( points[1] ).toBe( A );
    });

    it ("throws an error if the given point is not a valid Vector2", () => {
        let polygon = new Polygon();

        expect( () => polygon.addPoint() ).toThrowError();
        expect( () => polygon.addPoint("a") ).toThrowError();
        expect( () => polygon.addPoint(new Polygon()) ).toThrowError();
    });
});

describe("classes.polygon.removePoint", () => {
    it("removes an existing point from the polygon", () => {
        let A = new PathNode( new Vector2(1, 3) );
        let B = new PathNode( new Vector2(7, -2) );
        let C = new PathNode( new Vector2(1.5, -5.6) );

        let polygon = new Polygon( [A, B, C] );

        polygon.removePoint(B);

        let points = polygon.getPoints();

        expect( points.length ).toBe( 2 );
        expect( points[1] ).toBe( C );
    })

    it("throws an error if the given point isn't in the polygon", () => {
        let A = new PathNode( new Vector2(1, 3) );
        let B = new PathNode( new Vector2(7, -2) );
        let C = new PathNode( new Vector2(1.5, -5.6) );
        let D = new PathNode( new Vector2(1, 3) ); // same as A, but different object!

        let polygon = new Polygon( [A, B] );

        expect( () => polygon.removePoint(C) ).toThrowError();
        expect( () => polygon.removePoint(D) ).toThrowError();
    });
});