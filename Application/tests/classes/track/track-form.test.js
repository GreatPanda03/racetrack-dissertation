import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode, Track, TrackForm
} from "../../../src/core";


describe("classes.track-form.new", () => {
    it("creates a new TrackForm instance with default values", () => {
        
    });

    it("creates segments for each node of the track when it has nodes", () => {

    })

    it("throws an error if no valid Track is provided", () => {
        expect( () => new TrackForm() ).toThrowError();
        expect( () => new TrackForm("a") ).toThrowError();
    })
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

        let [left1, right1] = trackForm.getSegmentExtents(path[0]);
        let [left2, right2] = trackForm.getSegmentExtents(path[1]);
        let [left3, right3] = trackForm.getSegmentExtents(path[2]);
        let [left4, right4] = trackForm.getSegmentExtents(path[3]);

        // manual formulae for reference:
        // * left: p_nL = p_n + ½(w_n) * unit( perp(g_n) )
        // * right: p_nR = p_n - ½(w_n) * unit( perp(g_n) )

        // ... and so on
        // * where "n" is the index of the target node
        // * where "g" is the gradient at the target node
        //     calculated from SplineUtil.getGradientAtT()

        // realistically, since these are pixel positions,
        //   only integer accuracy is required

        // node 1
        expect( left1.x() ).toBeCloseTo( 54.96026474 );
        expect( left1.y() ).toBeCloseTo( -21.31692603 );

        expect( right1.x() ).toBeCloseTo( 45.03973526 );
        expect( right1.y() ).toBeCloseTo( -38.68307397 );

        // node 2
        expect( left2.x() ).toBeCloseTo( -35.04474364 );
        expect( left2.y() ).toBeCloseTo( 5.84212466 );

        expect( right2.x() ).toBeCloseTo( -44.95525636 )
        expect( right2.y() ).toBeCloseTo( 34.15787534 );
        
        // node 3
        expect( left3.x() ).toBeCloseTo( 97.51986763 );
        expect( left3.y() ).toBeCloseTo( -16.846012004 );

        expect( right3.x() ).toBeCloseTo( 102.48013237 );
        expect( right3.y() ).toBeCloseTo( -8.153987996 );

        // node 4
        expect( left4.x() ).toBeCloseTo( 118.0412394 );
        expect( left4.y() ).toBeCloseTo( -51.4035411 );

        expect( right4.x() ).toBeCloseTo( 134.5587606 );
        expect( right4.y() ).toBeCloseTo( -98.5964589 );
    });
});

describe("classes.track-form.addSegment", () => {
    it("adds a segment for a given node", () => {
        let track = new Track();
        let trackForm = new TrackForm(track);

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        // explicitly added
        trackForm.addSegment(path[0]);
        trackForm.addSegment(path[1]);
        trackForm.addSegment(path[2]);

        let [left1, right1 ] = trackForm.getSegmentExtents( path[0] );
        let [left2, right2 ] = trackForm.getSegmentExtents( path[1] );
        let [left3, right3 ] = trackForm.getSegmentExtents( path[2] );
        let [left4, right4 ] = trackForm.getSegmentExtents( path[3] );

        // node 1
        expect( left1.x() ).toBeCloseTo( 54.96026474 );
        expect( left1.y() ).toBeCloseTo( -21.31692603 );

        expect( right1.x() ).toBeCloseTo( 45.03973526 );
        expect( right1.y() ).toBeCloseTo( -38.68307397 );
        
        // node 2
        expect( left2.x() ).toBeCloseTo( -35.04474364 );
        expect( left2.y() ).toBeCloseTo( 5.84212466 );

        expect( right2.x() ).toBeCloseTo( -44.95525636 )
        expect( right2.y() ).toBeCloseTo( 34.15787534 );
        
        // node 3
        expect( left3.x() ).toBeCloseTo( 97.51986763 );
        expect( left3.y() ).toBeCloseTo( -16.846012004 );

        expect( right3.x() ).toBeCloseTo( 102.48013237 );
        expect( right3.y() ).toBeCloseTo( -8.153987996 );

        // node 4
        expect( left4.x() ).toBeCloseTo( 118.0412394 );
        expect( left4.y() ).toBeCloseTo( -51.4035411 );

        expect( right4.x() ).toBeCloseTo( 134.5587606 );
        expect( right4.y() ).toBeCloseTo( -98.5964589 );
    });

    it("assigns segments to the corresponding nodes even when added out of order", () => {
        let track = new Track();
        let trackForm = new TrackForm(track);

        let path = [
            new TrackNode(new Vector2(50, -30), 20, false),
            new TrackNode(new Vector2(-40, 20), 30, false),
            new TrackNode(new Vector2(100, -12.5), 10, false),
            new TrackNode(new Vector2(126.3, -75), 50, false)
        ];

        track.setPath(path);

        trackForm.addSegment(path[2]);
        trackForm.addSegment(path[3]);
        trackForm.addSegment(path[0]);
        trackForm.addSegment(path[1]);

        let [left1, right1 ] = trackForm.getSegmentExtents( path[0] );
        let [left2, right2 ] = trackForm.getSegmentExtents( path[1] );
        let [left3, right3 ] = trackForm.getSegmentExtents( path[2] );
        let [left4, right4 ] = trackForm.getSegmentExtents( path[3] );

        // node 1
        expect( left1.x() ).toBeCloseTo( 54.96026474 );
        expect( left1.y() ).toBeCloseTo( -21.31692603 );

        expect( right1.x() ).toBeCloseTo( 45.03973526 );
        expect( right1.y() ).toBeCloseTo( -38.68307397 );

        // node 2
        expect( left2.x() ).toBeCloseTo( -35.04474364 );
        expect( left2.y() ).toBeCloseTo( 5.84212466 );

        expect( right2.x() ).toBeCloseTo( -44.95525636 );
        expect( right2.y() ).toBeCloseTo( 34.15787534 );
        
        // node 3
        expect( left3.x() ).toBeCloseTo( 97.51986763 );
        expect( left3.y() ).toBeCloseTo( -16.846012004 );
        
        expect( right3.x() ).toBeCloseTo( 102.48013237 );
        expect( right3.y() ).toBeCloseTo( -8.153987996 );
        
        // node 4
        expect( left4.x() ).toBeCloseTo( 118.0412394 );
        expect( left4.y() ).toBeCloseTo( -51.4035411 );

        expect( right4.x() ).toBeCloseTo( 134.5587606 );
        expect( right4.y() ).toBeCloseTo( -98.5964589 );
    });
});