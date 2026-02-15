import { describe, it, expect } from "vitest";

import {
    Vector2, PathNode, Polygon,
    Material,
    MATERIAL_INFO
} from "../../../../src/core";


describe("classes.material.new", () => {
    it("creates an empty default Material", () => {
        let material = new Material();

        expect( material.getType() ).toBe( "Curb" );
        expect( material.getPoints().length ).toBe( 0 );
        expect( material instanceof Polygon ).toBe( true );
    });

    it("creates an empty Material out of Curb", () => {
        let material = new Material(undefined, MATERIAL_INFO.Curb.Name);

        expect( material.getType() ).toBe( "Curb" );
        expect( material.getPoints().length ).toBe( 0 );
    });

    it("creates a Material with points out of Water", () => {
        let point = new PathNode( new Vector2(3, 2) );

        let material = new Material([point], MATERIAL_INFO.Water.Name);

        expect( material.getType() ).toBe( "Water" );
        expect( material.getPoints().length ).toBe( 1 );
        expect( material.getPoints()[0] ).toBe( point );
    });

    it("throws an error if the provided material isn't recognised", () => {
        expect( () => new Material(undefined, null) ).toThrowError();
        expect( () => new Material(undefined, 5) ).toThrowError();
        expect( () => new Material(undefined, "AAA") ).toThrowError();
        expect( () => new Material(undefined, new Vector2()) ).toThrowError();
    });
});

describe("classes.material (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Material([
            new PathNode( new Vector2(3, 1) ),
            new PathNode( new Vector2(-2, 5) ),
            new PathNode( new Vector2(10.5, 10.5) )
        ], MATERIAL_INFO.Curb.Name);
        
        expect(() => {
            Material.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});