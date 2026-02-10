import { describe, it, expect } from "vitest";

import {
    Vector2, PathNode,
    Decoration
} from "../../../../src/core";


describe("classes.decoration.new", () => {
    it("creates a new Decoration", () => {
        let decoration = new Decoration();

        expect( decoration.getColour() ).toBe( "#cc77ff" );
        expect( decoration.getPoints().length ).toBe( 0 );
    });

    it("creates a Decoration with a default values", () => {
        let colour = "#ff0000";
        let points = [new PathNode( new Vector2(3, 5) )];

        let material = new Decoration(points, colour);

        expect( material.getPoints() ).toBe( points );
        expect( material.getColour() ).toBe( colour );
    });

    it("throws an error if the given colour isn't a string", () => {
        expect(() => new Decoration(undefined, null)).toThrowError();
        expect(() => new Decoration(undefined, 5)).toThrowError();
        expect(() => new Decoration(undefined, new Vector2())).toThrowError();
    });
});

describe("classes.decoration (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Decoration([
            new PathNode( new Vector2(3, 1) ),
            new PathNode( new Vector2(-2, 5) ),
            new PathNode( new Vector2(10.5, 10.5) )
        ], "#f00");
        
        expect(() => {
            Decoration.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});