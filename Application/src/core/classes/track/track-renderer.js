// manages instances of TrackRenderer objects
// * renders a given track to a given canvas


// [[ Imports ]] //
import Vector2 from "../geometry/vector2.js";
import TrackForm from "./track-form.js";
import Track from "./track.js";
import SplineUtil from "../../utilities/spline-util.js";



// [[ Main Class ]] //
export default class TrackRenderer extends TrackForm {
    _canvas;        // HTML canvas element
    _ctx;           // Context (never exposed)
    
    _nodesVisible;  // boolean
    _edgesVisible;  // boolean
    _trackVisible;  // boolean
    _offset;        // Vector2 (pixels, for panning)
    _spacing;       // int (pixels, for grid lines)

    constructor(track, canvas) {
        if (track == null || !(track instanceof Track)) {
            throw new Error(`[TrackRenderer] "${track}" is not a valid Track`);
        }

        if (canvas == null || canvas.tagName != "CANVAS") {
            throw new Error(`[TrackRenderer] "${canvas}" is not a valid Canvas`)
        }

        super(track);

        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");

        this._nodesVisible = true;
        this._edgesVisible = true;
        this._trackVisible = true;
        this._offset = new Vector2(0, 0);
        this._spacing = 25;
    }

    // getters / setters
    getCanvas() { return this._canvas; }

    getNodesVisible() { return this._nodesVisible; }
    setNodesVisible(visible) { this._nodesVisible = visible; }

    getEdgesVisible() { return this._edgesVisible; }
    setEdgesVisible(visible) { this._edgesVisible = visible; }

    getTrackVisible() { return this._trackVisible; }
    setTrackVisible(visible) { this._trackVisible = visible; }

    getOffset() { return this._offset; }
    setOffset(offset) { this._offset = offset; }

    // methods

    // draws all components of the track to the canvas
    redrawTrack() {
        this.clearCanvas();

        this.updateNodeExtents();

        let track = this._track;
        let canvas = this._canvas;
        let ctx = this._ctx;
        let spacing = this._spacing;

        let path = track.getPath();
        let leftSide = this.getLeftSide();
        let rightSide = this.getRightSide();
        let size = track.getSize();
        let looped = track.isLooped();

        // track path (a polygon with a whole)
        if (this._trackVisible && size > 0) {
            let res = 0.1;
            let tmax = looped ? size : size - 1;

            ctx.fillStyle = "#CCC";
            
            // preparing the first stroke into the left side
            if (looped) { // starting at on the left of Node 1
                let start = SplineUtil.getPointAtT(leftSide, 0, looped);
                ctx.moveTo(start.x(), start.y());

            } else { // the "closing line" of the start; the span of Node 1
                let startR = SplineUtil.getPointAtT(rightSide, 0, looped);
                let startL = SplineUtil.getPointAtT(leftSide, 0, looped);
                
                ctx.moveTo(startR.x(), startR.y());
                ctx.lineTo(startL.x(), startL.y());
            }

            // left track edge (drawn "clockwise")
            for (let t = 0; t < tmax; t += res) {
                let left1 = SplineUtil.getPointAtT(leftSide, t, looped);
                let left2 = SplineUtil.getPointAtT(leftSide, t + res, looped);

                ctx.lineTo(left1.x(), left1.y());
                ctx.lineTo(left2.x(), left2.y());
            }
            
            // preparing the first stroke into the right side
            if (looped) { // moving over to the right of Node 1
                let start = SplineUtil.getPointAtT(rightSide, tmax, looped);
                ctx.moveTo(start.x(), start.y());

            } else { // the "closing line" of the end; the span of Node N
                let endR = SplineUtil.getPointAtT(rightSide, tmax, looped);
                ctx.lineTo(endR.x(), endR.y());
            }
            
            // right track edge (drawn "anticlockwise" to create the hole)
            // * source: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
            for (let t = tmax; t >= res; t -= res) {
                let right1 = SplineUtil.getPointAtT(rightSide, t, looped);
                let right2 = SplineUtil.getPointAtT(rightSide, t - res, looped);

                ctx.lineTo(right1.x(), right1.y());
                ctx.lineTo(right2.x(), right2.y());
            }

            ctx.fill() // fill in based on all points
        }

        // checkpoints
        if (size > 0) {
            ctx.strokeStyle = "#000"; // Node 1 is the starting line

            let left = leftSide[0].getPosition();
            let right = rightSide[0].getPosition()
            this.#drawLine(left, right, 10);

            if (!looped) {
                let left = leftSide[size - 1].getPosition();
                let right = rightSide[size - 1].getPosition()
                this.#drawLine(left, right, 10);
            }

            ctx.strokeStyle = "#FC5"; // every other node

            for (let n = 1; n < size; n++) {
                if (path[n].isCheckpoint()) {
                    let left = leftSide[n].getPosition();
                    let right = rightSide[n].getPosition();
                    this.#drawLine(left, right, 10);
                }
            }
        }

        // edges
        if (this._edgesVisible) {
            ctx.strokeStyle = "#999";

            let nmax = looped ? size : size - 1;

            for (let n = 0; n < nmax; n++) {

                // central edge
                let mid1 = path[n].getPosition();
                let mid2 = path[(n + 1) % size].getPosition();                
                this.#drawLine(mid1, mid2, 5);

                // left edge
                let left1 = leftSide[n].getPosition();
                let left2 = leftSide[(n + 1) % size].getPosition();
                this.#drawLine(left1, left2, 2);

                // right edge
                let right1 = rightSide[n].getPosition();
                let right2 = rightSide[(n + 1) % size].getPosition();
                this.#drawLine(right1, right2, 2);

                // span
                this.#drawLine(left1, right1, 2);
            }
        }

        // nodes
        if (this._nodesVisible) {
            let ctx = this._ctx;
            ctx.font = "16px Segoe UI";
            ctx.strokeStyle = "#FFF";
            ctx.lineWidth = 1;
            ctx.textAlign = "center";

            for (let n = 0; n < size; n++) {

                // central node
                let mid = path[n].getPosition();
                this.#drawCircle(mid, 15, path[n].isCheckpoint() ? "#A5F" : "#5AF");
                ctx.strokeText((n + 1).toString(), mid.x(), mid.y() + 5);

                // left extent
                let left = leftSide[n].getPosition();
                this.#drawCircle(left, 5, "#C70");

                // right extent
                let right = rightSide[n].getPosition();
                this.#drawCircle(right, 5, "#0A0");
            }
        }

        // directional dot
        if (size >= 2) {
            let start = path[0].getPosition();
            let end = path[1].getPosition();
            let unit = end.sub(start).unit();
            let pos = start.add(unit.scale(50));

            this.#drawCircle(pos, 5, "#5AF");
        }
        
        // grid lines
        ctx.strokeStyle = "#0005"; // transluscent

        let gridR = Math.floor(canvas.height / spacing)
        let gridC = Math.floor(canvas.width / spacing)

        for (let r = 1; r < gridR; r += 1) {
            let start = new Vector2(0, r * spacing);
            let end = new Vector2(canvas.width, r * spacing);
            this.#drawLine(start, end, 1);
        }

        for (let c = 1; c < gridC; c += 1) {
            let start = new Vector2(c * spacing, 0);
            let end = new Vector2(c * spacing, canvas.height);
            this.#drawLine(start, end, 1);
        }
    }

    // auxiliary: draws a line between two points
    #drawLine(p1, p2, width) {
        let ctx = this._ctx;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x(), p1.y());
        ctx.lineTo(p2.x(), p2.y());
        ctx.stroke();
    }

    // auxiliary: draws a circle with the given properties
    #drawCircle(centre, radius, colour) {
        let ctx = this._ctx;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.ellipse(centre.x(), centre.y(), radius, radius, 0, 2 * Math.PI, 0);
        ctx.fill();
    }

    // clears the canvas
    clearCanvas() {
        let canvas = this._canvas;
        let ctx = this._ctx;
        let offset = this._offset;

        ctx.clearRect(-offset.x(), -offset.y(), canvas.width, canvas.height);
    }
}
