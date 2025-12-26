// manages instances of TrackRenderer objects
// * renders a given track to a given canvas


// [[ Imports ]] //
import Node from "./node.js";
import Vector2 from "./vector2.js";
import SplineUtil from "../utilities/spline-util.js";



// [[ Main Class ]] //
export default class TrackRenderer {
    #track;         // Track
    #canvas;        // HTML canvas element
    #ctx;           // Context (never exposed)
    
    #nodesVisible;  // boolean
    #edgesVisible;  // boolean
    #trackVisible;  // boolean
    #offset;        // Vector2
    #spacing;       // int (pixels)

    #leftSide;      // Node[]
    #rightSide;     // Node[]

    constructor(track, canvas) {
        this.#track = track;
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");

        this.#nodesVisible = true;
        this.#edgesVisible = true;
        this.#trackVisible = true;
        this.#offset = new Vector2(0, 0);
        this.#spacing = 25;

        this.#leftSide = [];
        this.#rightSide = [];
    }

    // getters / setters
    getCanvas() { return this.#canvas; }

    getTrack() { return this.#track; }
    getLeftSide() { return this.#leftSide; }
    getRightSide() { return this.#rightSide; }

    getNodesVisible() { return this.#nodesVisible }
    setNodesVisible(visible) { this.#nodesVisible = visible }

    getEdgesVisible() { return this.#edgesVisible }
    setEdgesVisible(visible) { this.#edgesVisible = visible }

    getTrackVisible() { return this.#trackVisible }
    setTrackVisible(visible) { this.#trackVisible = visible }

    getOffset() { return this.#offset; }
    setOffset(offset) { this.#offset = offset; }

    // methods

    // adds a left / right side around the given node
    addSegment(node) {
        let track = this.#track;
        let leftSide = this.#leftSide;
        let rightSide = this.#rightSide;

        let index = track.getNodeIndex(node);
        let [leftPos, rightPos] = this.getSegmentExtents(node);

        this.#leftSide = leftSide.toSpliced(index, 0, new Node(leftPos, 25, false));
        this.#rightSide = rightSide.toSpliced(index, 0, new Node(rightPos, 25, false));
    }

    // returns the extents of a node based on its width
    getSegmentExtents(node) {
        let track = this.#track;

        let path = track.getPath();
        let index = track.getNodeIndex(node);
        let midPos = node.getPosition();
        let width = node.getWidth();
        let looped = track.isLooped();

        let w2 = width / 2;

        let t = index;
        let gradient = SplineUtil.getGradientAtT(path, t, looped);
        let unit = gradient.unit();

        let leftPos = new Vector2(
            midPos.x() + w2 * -unit.y(),
            midPos.y() + w2 *  unit.x());

        let rightPos = new Vector2(
            midPos.x() - w2 * -unit.y(),
            midPos.y() - w2 *  unit.x());

        return [leftPos, rightPos];
    }

    // updates the extents of all nodes
    updateNodeExtents() {
        let track = this.#track;
        let leftSide = this.#leftSide;
        let rightSide = this.#rightSide;
        let path = track.getPath();

        for (let n = 0; n < path.length; n++) {
            let node = path[n];
            let [leftPos, rightPos] = this.getSegmentExtents(node);

            leftSide[n].setPosition(leftPos);
            rightSide[n].setPosition(rightPos);
        }
    }

    // draws all components of the track to the canvas
    redrawTrack() {
        this.clearCanvas();

        let track = this.#track;
        let canvas = this.#canvas;
        let ctx = this.#ctx;
        let spacing = this.#spacing;

        let path = track.getPath();
        let leftSide = this.#leftSide;
        let rightSide = this.#rightSide;
        let size = track.getSize();
        let looped = track.isLooped();

        this.updateNodeExtents();

        // triangles
        if (this.#trackVisible) {
            let res = 0.1;

            for (let t = 0; t < size; t += res) {
                let left1 = SplineUtil.getPointAtT(leftSide, t, looped);
                let left2 = SplineUtil.getPointAtT(leftSide, t + res, looped);
                let right1 = SplineUtil.getPointAtT(rightSide, t, looped);
                let right2 = SplineUtil.getPointAtT(rightSide, t + res, looped);

                // [left1, left2, right1] = this.#inflateTriangle(left1, left2, right1);
                // [left2, right1, right2] = this.#inflateTriangle(left2, right1, right2);

                this.#drawTriangle(left1, left2, right1, "#CCC");
                this.#drawTriangle(left2, right1, right2, "#CCC");
            }
        }

        // checkpoints
        // ...

        // edges
        if (this.#edgesVisible) {
            ctx.strokeStyle = "#999";

            for (let n = 0; n < size; n++) {

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
        if (this.#nodesVisible) {
            let ctx = this.#ctx;
            ctx.font = "16px Segoe UI";
            ctx.strokeStyle = "#FFF";
            ctx.lineWidth = 1;

            for (let n = 0; n < size; n++) {

                // central node
                let mid = path[n].getPosition();
                this.#drawCircle(mid, 15, path[n].isCheckpoint() ? "#A5F" : "#5AF");
                ctx.strokeText((n + 1).toString(), mid.x() - 4, mid.y() + 5);

                // left extent
                let left = leftSide[n].getPosition();
                this.#drawCircle(left, 5, "#0A0");

                // right extent
                let right = rightSide[n].getPosition();
                this.#drawCircle(right, 5, "#C70");
            }
        }

        
        // grid lines
        ctx.strokeStyle = "#0005"; // transluscent

        for (let r = 1; r < Math.floor(canvas.height / spacing); r += 1) {
            let start = new Vector2(0, r * spacing);
            let end = new Vector2(canvas.width, r * spacing);
            this.#drawLine(start, end, 1);
        }

        for (let c = 1; c < Math.floor(canvas.width / spacing); c += 1) {
            let start = new Vector2(c * spacing, 0);
            let end = new Vector2(c * spacing, canvas.height);
            this.#drawLine(start, end, 1);
        }
    }

    // auxiliary: draws a line between two points
    #drawLine(p1, p2, width) {
        let ctx = this.#ctx;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x(), p1.y());
        ctx.lineTo(p2.x(), p2.y());
        ctx.stroke();
    }

    // auxiliary: draws a circle with the given properties
    #drawCircle(centre, radius, colour) {
        let ctx = this.#ctx;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.ellipse(centre.x(), centre.y(), radius, radius, 0, 2 * Math.PI, 0);
        ctx.fill();
    }

    // auxiliary: draws a filled triangle between the given points
    //   with the given properties
    #drawTriangle(a, b, c, colour) {
        let ctx = this.#ctx;

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
        let canvas = this.#canvas;
        let ctx = this.#ctx;
        let offset = this.#offset;

        ctx.clearRect(-offset.x(), -offset.y(), canvas.width, canvas.height);
    }
}
