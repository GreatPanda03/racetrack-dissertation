import { describe, it, expect } from "vitest";

import {
    TrackNode, Material, 
    Track,
    MATERIAL_TYPE
} from "../../../src/core";


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



// [[ Node Tests ]] //

describe("classes.track.getSize", () => {
    it("returns the length of the track's path", () => {
        let track = new Track();
        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        expect( track.getSize() ).toBe(3);
    });
});

describe("classes.track.getNode", () => {
    it("returns the node at the given index", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), target, new TrackNode()]);

        expect( track.getNode(1) ).toBe( target );
    })

    it("throws an error if the index is out of bounds", () => {
        let track = new Track();
        track.setPath([new TrackNode(), new TrackNode]);

        expect( () => track.getNode(2) ).toThrowError();
        expect( () => track.getNode(-1) ).toThrowError();
    })
})

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

    it("throws an error if given node isn't in the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode()]);

        expect( () => track.getNodeBefore(target) ).toThrowError();
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

    it("throws an error if given node isn't in the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode()]);

        expect( () => track.getNodeAfter(target) ).toThrowError();
    });
});

describe("classes.track.addNode", () => {
    it("adds a new node to the end of the track", () => {
        let track = new Track();
        let node = new TrackNode();

        track.addNode(node);

        expect( track.getPath()[track.getSize() - 1] ).toBe(node);
    });

    it("throws an error if the node is already in the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([target, new TrackNode()]);

        expect( () => track.addNode(target) ).toThrowError();
    });

    it("throws an error if the node isn't a valid TrackNode", () => {
        let track = new Track();
        
        expect( () => track.addNode() ).toThrowError();
        expect( () => track.addNode("a") ).toThrowError();
        expect( () => track.addNode(new Vector2()) ).toThrowError();
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

    it("throws an error if the given index is beyond the current bounds", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        expect( () => track.addNodeAtIndex(target, 4) ).toThrowError();
        expect( () => track.addNodeAtIndex(target, -1) ).toThrowError();
    });
});

describe("classes.track.removeNode", () => {
    it("removes the given node from the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), target]);
        track.removeNode(target)

        expect( track.getSize() ).toBe( 2 );
    });

    it("throws an error if the given node is not in the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);

        expect( () => track.removeNode(target) ).toThrowError();
    });
});



// [[ Material Tests ]] // 

describe("classes.track.addMaterial", () => {
    it("adds the given material to the track", () => {
        let track = new Track();
        let material = new Material([], MATERIAL_TYPE.Water);

        track.addMaterial(material);

        expect( track.getMaterials()[0] ).toBe( material );
    });

    it("throws an error if the given material is already in the track", () => {
        let track = new Track();
        let material = new Material([], MATERIAL_TYPE.Water);

        track.addMaterial(material);

        expect( () => track.addMaterial(material) ).toThrowError();
    });
});