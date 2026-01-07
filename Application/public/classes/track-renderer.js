// manages instances of TrackRenderer objects
// * renders a given track to a given canvas


// [[ Imports ]] //
import Vector2 from "./vector2.js";
import Track from "./track.js";
import TrackForm from "./track-form.js";
import SplineUtil from "../utilities/spline-util.js";



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

        let track = this._track;
        let canvas = this._canvas;
        let ctx = this._ctx;
        let spacing = this._spacing;

        let path = track.getPath();
        let leftSide = this.getLeftSide();
        let rightSide = this.getRightSide();
        let size = track.getSize();
        let looped = track.isLooped();

        this.updateNodeExtents();

        // triangles
        if (this._trackVisible) {
            let res = 0.1;
            let tmax = looped ? size : size - 1;

            for (let t = 0; t < tmax; t += res) {
                let left1  = SplineUtil.getPointAtT(leftSide , t      , looped);
                let left2  = SplineUtil.getPointAtT(leftSide , t + res, looped);
                let right1 = SplineUtil.getPointAtT(rightSide, t      , looped);
                let right2 = SplineUtil.getPointAtT(rightSide, t + res, looped);

                // [left1, left2, right1] = this.#inflateTriangle(left1, left2, right1);
                // [left2, right1, right2] = this.#inflateTriangle(left2, right1, right2);

                this.#drawTriangle(left1, left2, right1, "#CCC");
                this.#drawTriangle(left2, right1, right2, "#CCC");
            }
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
                this.#drawCircle(left, 5, "#0A0");

                // right extent
                let right = rightSide[n].getPosition();
                this.#drawCircle(right, 5, "#C70");
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

    // auxiliary: draws a filled triangle between the given points
    //   with the given properties
    #drawTriangle(a, b, c, colour) {
        let ctx = this._ctx;

        let triangle = new Path2D();
        triangle.moveTo(a.x(), a.y());
        triangle.lineTo(b.x(), b.y());
        triangle.lineTo(c.x(), c.y());
        triangle.closePath();
        
        ctx.fillStyle = colour;
        ctx.fill(triangle);
    }

    // auxiliary: returns the given points "inflated" around their centre
    // * mainly to mitigate the gap between adjacent triangles
    // * TODO: generalise?
    #inflateTriangle(a, b, c) {
        let m = (a.add(b).add(c)).scale(1/3);

        a = (m.add(a.sub(m))).scale(1.01);
        b = (m.add(b.sub(m))).scale(1.01);
        c = (m.add(c.sub(m))).scale(1.01);

        return [a, b, c];
    }

    // clears the canvas
    clearCanvas() {
        let canvas = this._canvas;
        let ctx = this._ctx;
        let offset = this._offset;

        ctx.clearRect(-offset.x(), -offset.y(), canvas.width, canvas.height);
    }
}
