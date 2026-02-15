import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode, Track, TrackForm
} from "../../../src/core";


describe("classes.track-form.new", () => {
    it("creates a new TrackForm instance with default values", () => {
        let track = new Track();
        let form = new TrackForm(track);

        expect( Object.values(form.getNodeSpans()).length ).toBe( 0 );
        expect( form.getBoundaries().length ).toBe( 0 );
    });

    // invokes ".calculateNodeSpans()"
    it("gathers form information from the track when it has nodes", () => {
        let track = new Track();

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        let form = new TrackForm(track);

        let span1 = form.getNodeSpan(0);
        let span2 = form.getNodeSpan(1);
        let span3 = form.getNodeSpan(2);
        let span4 = form.getNodeSpan(3);

        // node 1
        expect( span1.start.x ).toBeCloseTo( 54.96026474 );
        expect( span1.start.y ).toBeCloseTo( -21.31692603 );

        expect( span1.end.x ).toBeCloseTo( 45.03973526 );
        expect( span1.end.y ).toBeCloseTo( -38.68307397 );
        
        // node 2
        expect( span2.start.x ).toBeCloseTo( -35.04474364 );
        expect( span2.start.y ).toBeCloseTo( 5.84212466 );

        expect( span2.end.x ).toBeCloseTo( -44.95525636 )
        expect( span2.end.y ).toBeCloseTo( 34.15787534 );
        
        // node 3
        expect( span3.start.x ).toBeCloseTo( 97.51986763 );
        expect( span3.start.y ).toBeCloseTo( -16.846012004 );

        expect( span3.end.x ).toBeCloseTo( 102.48013237 );
        expect( span3.end.y ).toBeCloseTo( -8.153987996 );

        // node 4
        expect( span4.start.x ).toBeCloseTo( 118.0412394 );
        expect( span4.start.y ).toBeCloseTo( -51.4035411 );

        expect( span4.end.x ).toBeCloseTo( 134.5587606 );
        expect( span4.end.y ).toBeCloseTo( -98.5964589 );

        // boundary check
        let boundaries = form.getBoundaries();
        expect( boundaries.length ).toBe( path.length * (1 / 0.1) * 2 );
        // > nodes * (1 / resolution), then x2 for each side
    });

    it("throws an error if no valid Track is provided", () => {
        expect( () => new TrackForm() ).toThrowError();
        expect( () => new TrackForm("a") ).toThrowError();
        expect( () => new TrackForm(new Vector2()) ).toThrowError();
    });
});

describe("classes.track-form.getNodeSpan", () => {
    it("returns the extents of the given node", () => {
        let track = new Track();

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        // segments automatically added
        let form = new TrackForm(track);

        let span = form.getNodeSpan(2);

        expect( span.start.x ).toBeCloseTo( 97.51986763 );
        expect( span.start.y ).toBeCloseTo( -16.846012004 );

        expect( span.end.x ).toBeCloseTo( 102.48013237 );
        expect( span.end.y ).toBeCloseTo( -8.153987996 );
    });
});

describe("classes.track-form.getSplitNodeSpans", () => {
    it("returns the node spans split by the left and right sides as Vector2 values", () => {
        let track = new Track();

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        let form = new TrackForm(track);
        let [left, right] = form.getSplitNodeSpans();

        // node 1
        expect( left[0].x ).toBeCloseTo( 54.96026474 );
        expect( left[0].y ).toBeCloseTo( -21.31692603 );

        expect( right[0].x ).toBeCloseTo( 45.03973526 );
        expect( right[0].y ).toBeCloseTo( -38.68307397 );
        
        // node 2
        expect( left[1].x ).toBeCloseTo( -35.04474364 );
        expect( left[1].y ).toBeCloseTo( 5.84212466 );

        expect( right[1].x ).toBeCloseTo( -44.95525636 )
        expect( right[1].y ).toBeCloseTo( 34.15787534 );
        
        // node 3
        expect( left[2].x ).toBeCloseTo( 97.51986763 );
        expect( left[2].y ).toBeCloseTo( -16.846012004 );

        expect( right[2].x ).toBeCloseTo( 102.48013237 );
        expect( right[2].y ).toBeCloseTo( -8.153987996 );

        // node 4
        expect( left[3].x ).toBeCloseTo( 118.0412394 );
        expect( left[3].y ).toBeCloseTo( -51.4035411 );

        expect( right[3].x ).toBeCloseTo( 134.5587606 );
        expect( right[3].y ).toBeCloseTo( -98.5964589 );
    });
});

describe("classes.track-form.calculateNodeSpans", () => {
    it("calculates the node spans of the given track", () => {
        // covered by "classes.track-form.new"
    });
});

describe("classes.track-form.calculateBoundaries", () => {
    it("calculates the node spans of the given track", () => {
        // covered by "classes.track-form.new"
    });
});