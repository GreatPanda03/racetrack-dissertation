import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode
} from "../../../../src/core";


describe("classes.track-node.new", () => {
    it("creates a new TrackNode", () => {
        let position = new Vector2(2, 3);
        let width = 100;
        let checkpoint = true;

        let node = new TrackNode(position, width, checkpoint);

        expect( node.getPosition().x ).toBe( position.x );
        expect( node.getPosition().y ).toBe( position.y );
        expect( node.getWidth()     ).toBe( width );
        expect( node.isCheckpoint() ).toBe( checkpoint );
    });

    it("creates a new TrackNode with default values", () => {
        let node = new TrackNode();

        expect( node.getPosition().x ).toEqual( 0 );
        expect( node.getPosition().y ).toEqual( 0 );
        expect( node.getWidth() ).toEqual( 50 );
        expect( node.isCheckpoint() ).toEqual( false );
    });

    it("throws an error when position is not a valid Vector2", () => {
        expect( () => new TrackNode("4", 50, true) ).toThrowError();
        expect( () => new TrackNode(new Vector2("4", 5), 50, true) ).toThrowError();
    });

    it("throws an error when width is not a number", () => {
        expect( () => new TrackNode(new Vector2(), null, true) ).toThrowError();
        expect( () => new TrackNode(new Vector2(), "50", true) ).toThrowError();
        expect( () => new TrackNode(new Vector2(), new Vector2(), true) ).toThrowError();
    });

    it("throws an error when checkpoint is not a boolean", () => {
        expect( () => new TrackNode(new Vector2(), 50, null) ).toThrowError();
        expect( () => new TrackNode(new Vector2(), 50, "true") ).toThrowError();
        expect( () => new TrackNode(new Vector2(), 50, new Vector2()) ).toThrowError();
    });
});

describe("classes.track-node (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new TrackNode(new Vector2(3, 1), 100, true);
        
        expect(() => {
            TrackNode.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});