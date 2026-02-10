import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode, Track, TrackForm
} from "../../../src/core";


// * NOTE: since ~v1.3.0, vector positions for track nodes are rounded, 
//     so are slightly off - expected accuracy is now to 0dp to pass
//     (the original numbers are still the same hand-calculated ones that
//     were used for the unit tests of older versions)


describe("classes.track-form.new", () => {
    it("creates a new TrackForm instance with default values", () => {
        let track = new Track();
        let form = new TrackForm(track);

        expect( Object.values(form.getNodeSpans()).length ).toBe( 0 );
        expect( form.getBoundaries().length ).toBe( 0 );
    });

    it("gathers form information from the track when it has nodes", () => {
        let track = new Track();

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        let trackForm = new TrackForm(track);

        let span1 = trackForm.getNodeSpan(0);
        let span2 = trackForm.getNodeSpan(1);
        let span3 = trackForm.getNodeSpan(2);
        let span4 = trackForm.getNodeSpan(3);

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
    });

    it("throws an error if no valid Track is provided", () => {
        expect( () => new TrackForm() ).toThrowError();
        expect( () => new TrackForm("a") ).toThrowError();
        expect( () => new TrackForm(new Vector2()) ).toThrowError();
    });
});

describe("classes.track-form.getSegmentExtents", () => {
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
        let trackForm = new TrackForm(track);

        let span = trackForm.getNodeSpan(2);

        expect( span.start.x ).toBeCloseTo( 97.51986763 );
        expect( span.start.y ).toBeCloseTo( -16.846012004 );

        expect( span.end.x ).toBeCloseTo( 102.48013237 );
        expect( span.end.y ).toBeCloseTo( -8.153987996 );
    });
});