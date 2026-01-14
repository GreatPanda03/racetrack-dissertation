import { describe, it, expect } from "vitest";

import {
    Track, TrackRenderer
} from "../../../src/core";

import { JSDOM } from "jsdom";


describe("classes.track-renderer.new", () => {
    it("creates a new TrackRenderer instance", () => {

    });

    it("throws an error if track is not a Track", () => {
        let canvas = new JSDOM("<canvas></canvas>");
        
        expect( () => new TrackRenderer(null, canvas) ).toThrowError();
        expect( () => new TrackRenderer("a", canvas) ).toThrowError();
    });

    it("throws an error if canvas is not a Canvas element", () => {
        let nonCanvas = new JSDOM("<div></div>").window.document.getElementsByTagName("div")[0];
        let track = new Track();

        expect( () => new TrackRenderer(track, null) ).toThrowError();
        expect( () => new TrackRenderer(track, "a") ).toThrowError();
        expect( () => new TrackRenderer(track, nonCanvas) ).toThrowError();
    });
});

// not sure how to verify the drawing methods...