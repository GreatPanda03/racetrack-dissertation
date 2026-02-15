import { describe, it, expect } from "vitest";

import {
    Vector2, PathNode,
    Obstacle
} from "../../../../src/core";


describe("classes.obstacle.new", () => {
    it("creates a new Obstacle", () => {
        let obstacle = new Obstacle();

        expect( obstacle.getPoints().length ).toBe( 0 );
        expect( obstacle instanceof Obstacle ).toBe( true );
    });

    it("creates a Obstacle with a default values", () => {
        let points = [new PathNode( new Vector2(3, 5) )];

        let obstacle = new Obstacle(points);

        expect( obstacle.getPoints() ).toBe( points );
    });
});

describe("classes.obstacle (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Obstacle([
            new PathNode( new Vector2(3, 1) ),
            new PathNode( new Vector2(-2, 5) ),
            new PathNode( new Vector2(10.5, 10.5) )
        ]);
        
        expect(() => {
            Obstacle.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});