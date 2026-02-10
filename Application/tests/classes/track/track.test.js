import { describe, it, expect } from "vitest";

import {
    TrackNode, Material, Obstacle, Decoration, Track,
    MATERIAL_INFO
} from "../../../src/core";


describe("classes.track.new", () => {
    it("creates a new Track with default values", () => {
        let track = new Track();

        expect( typeof track.getName() ).toBe( "string" );
        expect( typeof track.getDescription() ).toBe( "string" );
        expect( typeof track.getAuthorId() ).toBe( "string" );
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

    it("throws an error when the node isn't in the track", () => {
        let target = new TrackNode();
        let track = new Track();
        
        expect( () => track.getNodeIndex(target) ).toThrowError();
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

    it("throws an error if the node isn't a valid TrackNode", () => {
        let track = new Track();
        
        expect( () => track.addNode() ).toThrowError();
        expect( () => track.addNode("a") ).toThrowError();
        expect( () => track.addNode(new Vector2()) ).toThrowError();
    });

    it("throws an error if the node is already in the track", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([target, new TrackNode()]);

        expect( () => track.addNode(target) ).toThrowError();
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

    it("adds a new node to the start of the track if the index is below the track bounds", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);
        track.addNodeAtIndex(target, 5);

        expect( track.getPath()[track.getSize() - 1] ).toBe(target);
    });

    it("adds a new node to the end of the track if the index is beyond the track bounds", () => {
        let track = new Track();
        let target = new TrackNode();

        track.setPath([new TrackNode(), new TrackNode(), new TrackNode()]);
        track.addNodeAtIndex(target, -2);

        expect( track.getPath()[0] ).toStrictEqual(target);
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
        let material = new Material([], MATERIAL_INFO.Water.Name);

        track.addMaterial(material);

        expect( track.getMaterials()[0] ).toBe( material );
    });

    it("throws an error if no valid Material is provided", () => {
        let track = new Track();

        expect( () => track.addMaterial() ).toThrowError();
        expect( () => track.addMaterial("a") ).toThrowError();
        expect( () => track.addMaterial(new TrackNode()) ).toThrowError();
    });

    it("throws an error if the given material is already on the track", () => {
        let track = new Track();
        let material = new Material([], MATERIAL_INFO.Water.Name);

        track.addMaterial(material);

        expect( () => track.addMaterial(material) ).toThrowError();
    });
});

describe("classes.track.removeMaterial", () => {
    it("removes the given material from the track", () => {
        let track = new Track();
        let material = new Material([], MATERIAL_INFO.Water.Name);

        track.addMaterial(material);
        track.removeMaterial(material);

        expect( track.getMaterials().length ).toBe( 0 );
    });

    it("throws an error if the material isn't on the track", () => {
        let track = new Track();

        expect( () => track.removeMaterial() ).toThrowError();
        expect( () => track.removeMaterial("a") ).toThrowError();
        expect( () => track.removeMaterial(new TrackNode()) ).toThrowError();
    });
});



// [[ Obstacle Tests ]] // 

describe("classes.track.addObstacle", () => {
    it("adds the given obstacle to the track", () => {
        let track = new Track();
        let obstacle = new Obstacle();

        track.addObstacle(obstacle);

        expect( track.getObstacles()[0] ).toBe( obstacle );
    });

    it("throws an error if no valid Obstacle is provided", () => {
        let track = new Track();

        expect( () => track.addObstacle() ).toThrowError();
        expect( () => track.addObstacle("a") ).toThrowError();
        expect( () => track.addObstacle(new TrackNode()) ).toThrowError();
    });

    it("throws an error if the given obstacle is already on the track", () => {
        let track = new Track();
        let obstacle = new Obstacle();

        track.addObstacle(obstacle);

        expect( () => track.addObstacle(obstacle) ).toThrowError();
    });
});

describe("classes.track.removeObstacle", () => {
    it("removes the given obstacle from the track", () => {
        let track = new Track();
        let obstacle = new Obstacle();

        track.addObstacle(obstacle);
        track.removeObstacle(obstacle);

        expect( track.getObstacles().length ).toBe( 0 );
    });

    it("throws an error if the decoration isn't on the track", () => {
        let track = new Track();

        expect( () => track.removeObstacle() ).toThrowError();
        expect( () => track.removeObstacle("a") ).toThrowError();
        expect( () => track.removeObstacle(new TrackNode()) ).toThrowError();
    });
});



// [[ Decoration Tests ]] // 

describe("classes.track.addDecoration", () => {
    it("adds the given decoration to the track", () => {
        let track = new Track();
        let decoration = new Decoration();

        track.addDecoration(decoration);

        expect( track.getDecorations()[0] ).toBe( decoration );
    });

    it("throws an error if no valid Decoration is provided", () => {
        let track = new Track();

        expect( () => track.addDecoration() ).toThrowError();
        expect( () => track.addDecoration("a") ).toThrowError();
        expect( () => track.addDecoration(new TrackNode()) ).toThrowError();
    });

    it("throws an error if the given decoration is already on the track", () => {
        let track = new Track();
        let decoration = new Decoration();

        track.addDecoration(decoration);

        expect( () => track.addDecoration(decoration) ).toThrowError();
    });
});

describe("classes.track.removeDecoration", () => {
    it("removes the given decoration from the track", () => {
        let track = new Track();
        let decoration = new Decoration();

        track.addDecoration(decoration);
        track.removeDecoration(decoration);

        expect( track.getDecorations().length ).toBe( 0 );
    });

    it("throws an error if the decoration isn't on the track", () => {
        let track = new Track();

        expect( () => track.removeDecoration() ).toThrowError();
        expect( () => track.removeDecoration("a") ).toThrowError();
        expect( () => track.removeDecoration(new TrackNode()) ).toThrowError();
    });
});


describe("classes.track (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Track([new TrackNode()]);
        instance.addMaterial(new Material([], MATERIAL_INFO.Curb.Name));
        instance.addObstacle(new Obstacle());
        instance.addDecoration(new Decoration());

        expect(() => {
            Track.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});