import { describe, it, expect } from "vitest";

import {
    Vector2, PathNode
} from "../../../src/core";


describe("classes.path-node.new", () => {
    it("creates a PathNode at a position", () => {
        let node = new PathNode( new Vector2(5, 3) );

        expect( node.getPosition().x ).toBe( 5 );
        expect( node.getPosition().y ).toBe( 3 );
    });

    it("creates a new PathNode with a default zero-vector position", () => {
        let node = new PathNode();

        expect( node.getPosition().x ).toBe( 0 );
        expect( node.getPosition().y ).toBe( 0 );
    });

    it("throws an error when an invalid position is given", () => {
        expect( () => new PathNode("a") ).toThrowError();
        expect( () => new PathNode( new PathNode() ) ).toThrowError();
    });
});


describe("classes.path-node (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new PathNode( new Vector2(-3, 2) );

        expect(() => {
            PathNode.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});

