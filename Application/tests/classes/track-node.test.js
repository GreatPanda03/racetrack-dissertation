import { describe, it, expect } from "vitest";

import Vector2 from "../../public/classes/vector2.js";
import TrackNode from "../../public/classes/track-node.js";


describe("classes.track-node.unit", () => {
    it("creates a new TrackNode", () => {
        let position = new Vector2(2, 3);
        let width = 50;
        let checkpoint = true;

        let node = new TrackNode(position, width, checkpoint);

        expect( node.getPosition()  ).toBe( position );
        expect( node.getWidth()     ).toBe( width );
        expect( node.isCheckpoint() ).toBe( checkpoint );
    });

    it("creates a new TrackNode with default values", () => {
        let node = new TrackNode();

        expect( node.getPosition().x() ).toEqual( 0 );
        expect( node.getPosition().y() ).toEqual( 0 );
    });

    it("throws an error when position is not a valid Vector2", () => {
        expect( () => new TrackNode("4", 50, true) ).toThrow();
        expect( () => new TrackNode(new Vector2("4", 5), 50, true) ).toThrow();
    });

    it("throws an error when width is not a number", () => {
        expect( () => new TrackNode(new Vector2(), "50", true) ).toThrow();
    });

    it("throws an error when checkpoint is not a boolean", () => {
        expect( () => new TrackNode(new Vector2(), 50, "true") ).toThrow();
    });
});