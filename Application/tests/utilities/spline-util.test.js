import { describe, it, expect } from "vitest";

import {
    Vector2,
    TrackNode,
    SplineUtil
} from "../../src/core";


// desmos visualiser (created by Muhammad Mogra):
// * https://www.desmos.com/calculator/yerscywwaf


describe("utilities.spline-util.getInfluencersAtT", () => {
    it("throws an error when the given path is empty", () => {
        let path = [];

        expect( () => SplineUtil.getInfluencersAtT(path, 2, true) ).toThrowError();
    });
});

describe("utilities.spline-util.getInfluencersAtT.looped", () => {
    it("returns the influencers when they are in the middle of a looped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 2, true);

        expect( [p0, p1, p2, p3] ).toEqual( [1, 2, 3, 4] );
    });

    it("returns the influencers when they cross the start of a looped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 0, true);

        expect( [p0, p1, p2, p3] ).toEqual( [4, 0, 1, 2] );
    });

    it("returns the influencers when they cross the end of a looped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 3, true);

        expect( [p0, p1, p2, p3] ).toEqual( [2, 3, 4, 0] );
    });

    it("returns the influencers when fewer than 4 nodes are in a looped track", () => {
        let path = [new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 1, true);

        expect( [p0, p1, p2, p3] ).toEqual( [0, 1, 0, 1] );
    });
});

describe("utilities.spline-util.getInfluencersAtT.unlooped", () => {
    it("returns the influencers when they are in the middle of an unlooped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 2, false);

        expect( [p0, p1, p2, p3] ).toEqual( [1, 2, 3, 4] );
    });

    it("returns the influencers when they cross the start of an unlooped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 0, false);

        expect( [p0, p1, p2, p3] ).toEqual( [0, 0, 1, 2] );
    });

    it("returns the influencers when they cross the end of an unlooped track", () => {
        let path = [new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 3, false);

        expect( [p0, p1, p2, p3] ).toEqual( [2, 3, 4, 4] );
    });

    it("returns the influencers when fewer than 4 nodes are in an unlooped track", () => {
        let path = [new TrackNode(), new TrackNode()];

        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(path, 0, false);

        expect( [p0, p1, p2, p3] ).toEqual( [0, 0, 1, 1] );
    });
});

describe("utilities.spline-util.getPointAtT.looped", () => {
    it("returns the point along a looped path at t", () => {
        let path = [
            new TrackNode(new Vector2(-32.2, 45.7)),
            new TrackNode(new Vector2(-40.4, -37.3)),
            new TrackNode(new Vector2(20, 10)),
            new TrackNode(new Vector2(56, -29.5)),
            new TrackNode(new Vector2(100, 0.5)),
            new TrackNode(new Vector2(55, 43))
        ];

        let point = SplineUtil.getPointAtT(path, 2.35, true);

        expect( point.x() ).toBeCloseTo( 34.085575, 5 );
        expect( point.y() ).toBeCloseTo( -0.17419375, 5 );
    });

        it("returns the point along the edge of a looped path at t", () => {
        let path = [
            new TrackNode(new Vector2(-32.2, 45.7)),
            new TrackNode(new Vector2(-40.4, -37.3)),
            new TrackNode(new Vector2(20, 10)),
            new TrackNode(new Vector2(56, -29.5)),
            new TrackNode(new Vector2(100, 0.5)),
            new TrackNode(new Vector2(55, 43))
        ];

        let point = SplineUtil.getPointAtT(path, 4.68, true);

        expect( point.x() ).toBeCloseTo( 75.6207488, 5 );
        expect( point.y() ).toBeCloseTo( 31.9093632, 5 );
    });
});

describe("utilities.spline-util.getPointAtT.unlooped", () => {
    it("returns the point along an unlooped path at t", () => {
        let path = [
            new TrackNode(new Vector2(-32.2, 45.7)),
            new TrackNode(new Vector2(-40.4, -37.3)),
            new TrackNode(new Vector2(20, 10)),
            new TrackNode(new Vector2(56, -29.5)),
            new TrackNode(new Vector2(100, 0.5)),
            new TrackNode(new Vector2(55, 43))
        ];

        let point = SplineUtil.getPointAtT(path, 2.35, false);

        expect( point.x() ).toBeCloseTo( 34.085575, 5 );
        expect( point.y() ).toBeCloseTo( -0.17419375, 5 );
    });

    it("returns the point along the edge of an unlooped path at t", () => {
        let path = [
            new TrackNode(new Vector2(-32.2, 45.7)),
            new TrackNode(new Vector2(-40.4, -37.3)),
            new TrackNode(new Vector2(20, 10)),
            new TrackNode(new Vector2(56, -29.5)),
            new TrackNode(new Vector2(100, 0.5)),
            new TrackNode(new Vector2(55, 43))
        ];

        let point = SplineUtil.getPointAtT(path, 4.68, false);

        expect( point.x() ).toBeCloseTo( 69.169344, 5 );
        expect( point.y() ).toBeCloseTo( 32.10912, 5 );
    });
});

// basically just the differentiated version of .getPointAtT...
describe("utilities.spline-util.getGradientAtT", () => {
    it("returns the gradient of the path at t", () => {
        let path = [
            new TrackNode(new Vector2(-32.2, 45.7)),
            new TrackNode(new Vector2(-40.4, -37.3)),
            new TrackNode(new Vector2(20, 10)),
            new TrackNode(new Vector2(56, -29.5)),
            new TrackNode(new Vector2(100, 0.5)),
            new TrackNode(new Vector2(55, 43))
        ];

        let point = SplineUtil.getGradientAtT(path, 4.68, false);

        expect( point.x() ).toBeCloseTo( -59.1976, 5 );
        expect( point.y() ).toBeCloseTo( 44.002, 5 );
    });
});
