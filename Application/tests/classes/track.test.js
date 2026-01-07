import { describe, it, expect } from "vitest";

import TrackNode from "../../public/classes/track-node.js";
import Vector2 from "../../public/classes/vector2.js";
import Track from "../../public/classes/track.js";


describe("classes.track.new", () => {
    it("creates a new Track with default values", () => {
        let track = new Track();

        expect( typeof track.getTrackId() ).toBe( "number" );

        expect( typeof track.getName() ).toBe( "string" );
        expect( typeof track.getDescription() ).toBe( "string" );
        expect( typeof track.getAuthorId() ).toBe( "number" );
        expect( typeof track.getAuthor() ).toBe( "string" );
        expect( track.getTags() ).toEqual( [] );

        expect( track.getPath() ).toEqual( [] );
        expect( track.getMaterials() ).toEqual( [] );
        expect( track.getObstacles() ).toEqual( [] );
        expect( track.getDecorations() ).toEqual( [] );

        expect( typeof track.isLooped() ).toBe( "boolean" );
    });
});

describe("classes.track.getNodeIndex", () => {
    it("returns the index of the target node", () => {
        let track = new Track();
        let target = new TrackNode();
        
        track.setPath([new TrackNode(), new TrackNode(), target, new TrackNode()]);
        
        expect( track.getNodeIndex(target) ).toBe(2);
    });

    it("returns a 'non-existent' value when the node isn't in the track", () => {
        let track = new Track();
        let target = new TrackNode();
        
        track.setPath([new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()]);
        
        expect( track.getNodeIndex(target) ).toBe(-1);
    });
});

describe("classes.track.getNodeBefore", () => {
    it("returns the node before the target", () => {
        let track = new Track();
        let target = new TrackNode();
        let expected = new TrackNode();

        track.setPath([new TrackNode(), expected, target, new TrackNode()]);

        expect( track.getNodeBefore(target) ).toBe(expected);
    });

    it("loops to the end when the target is the first node", () => {
        let track = new Track();
        let target = new TrackNode();
        let expected = new TrackNode();

        track.setPath([target, new TrackNode(), new TrackNode(), expected]);

        expect( track.getNodeBefore(target) ).toBe(expected);
    });
});

describe("classes.track.getNodeAfter", () => {
    it("returns the node after the target", () => {
        let track = new Track();
        let target = new TrackNode();
        let expected = new TrackNode();

        track.setPath([new TrackNode(), target, expected, new TrackNode()]);

        expect( track.getNodeAfter(target) ).toBe(expected);
    });

    it("loops to the start when the target is the last node", () => {
        let track = new Track();
        let target = new TrackNode();
        let expected = new TrackNode();

        track.setPath([expected, new TrackNode(), new TrackNode(), target]);

        expect( track.getNodeAfter(target) ).toBe(expected);
    });
});

describe("classes.track.addNode", () => {
    it("adds a new node to the end of the track", () => {
        let track = new Track();
        let node = new TrackNode();

        track.addNode(node);

        expect( track.getPath()[track.getSize() - 1] ).toBe(node);
    });
});

describe("classes.track.addNodeAtIndex", () => {
    it("adds a new node to the track at the given index", () => {
        let track = new Track();
        let node = new TrackNode();
        let index = 2;

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);
        track.addNodeAtIndex(node, index);

        expect( track.getPath()[index] ).toBe(node);
    });

    it("adds a new node as the last node when the index is beyond the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);
        
        expect( () => track.addNodeAtIndex(target, 5) ).toThrowError()
    });

    it("adds a new node as the first node when the index is less than 0", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);
        
        expect( () => track.addNodeAtIndex(target, -1) ).toThrowError()
    });
});

describe("classes.track.getSize", () => {
    it("returns the length of the track's path", () => {
        let track = new Track();
        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        expect( track.getSize() ).toBe(3);
    })
});
