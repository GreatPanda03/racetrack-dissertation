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
    
    #nodesVisible;  // boolean
    #edgesVisible;  // boolean
    #trackVisible;  // boolean
    #offset;        // Vector2

    #leftSide;      // Node[]
    #rightSide;     // Node[]

    constructor(track, canvas) {
        this.#track = track;
        this.#canvas = canvas;

        this.#nodesVisible = true;
        this.#edgesVisible = true;
        this.#trackVisible = true;
        this.#offset = new Vector2(0, 0);

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
    
        let ctx = this.#canvas.getContext("2d");

        let track = this.#track;
        let path = track.getPath();
        let leftSide = this.#leftSide;
        let rightSide = this.#rightSide;
        let size = track.getSize();
        let looped = track.isLooped();

        this.updateNodeExtents();

        // triangles
        if (this.#trackVisible) {
            ctx.fillStyle = "#CCC";

            let res = 0.1;

            for (let t = 0; t < size; t += res) {
                let left1 = SplineUtil.getPointAtT(leftSide, t, looped);
                let left2 = SplineUtil.getPointAtT(leftSide, t + res, looped);
                let right1 = SplineUtil.getPointAtT(rightSide, t, looped);
                let right2 = SplineUtil.getPointAtT(rightSide, t + res, looped);

                let triangle1 = new Path2D();
                triangle1.moveTo(left1.x(), left1.y());
                triangle1.lineTo(right1.x(), right1.y());
                triangle1.lineTo(left2.x(), left2.y());
                triangle1.closePath();

                let triangle2 = new Path2D();
                triangle2.moveTo(left2.x(), left2.y());
                triangle2.lineTo(right2.x(), right2.y());
                triangle2.lineTo(right1.x(), right1.y());
                triangle2.closePath();
                
                ctx.fill(triangle1);
                ctx.fill(triangle2);
            }
        }

        // edges
        if (this.#edgesVisible) {
            ctx.strokeStyle = "#999";

            for (let n = 0; n < size; n++) {

                // central edge
                let mid1 = path[n].getPosition();
                let mid2 = path[(n + 1) % size].getPosition();

                ctx.lineWidth = 5;

                ctx.beginPath();
                ctx.moveTo(mid1.x(), mid1.y());
                ctx.lineTo(mid2.x(), mid2.y());
                ctx.stroke();

                ctx.lineWidth = 2;

                // left edge
                let left1 = leftSide[n].getPosition();
                let left2 = leftSide[(n + 1) % size].getPosition();

                ctx.beginPath();
                ctx.moveTo(left1.x(), left1.y());
                ctx.lineTo(left2.x(), left2.y());
                ctx.stroke();

                // right edge
                let right1 = rightSide[n].getPosition();
                let right2 = rightSide[(n + 1) % size].getPosition();

                ctx.beginPath();
                ctx.moveTo(right1.x(), right1.y());
                ctx.lineTo(right2.x(), right2.y());
                ctx.stroke();

                // span
                ctx.moveTo(left1.x(), left1.y());
                ctx.lineTo(right1.x(), right1.y());
                ctx.stroke();
            }
        }

        // nodes
        if (this.#nodesVisible) {
            ctx.font = "16px Segoe UI";
            ctx.strokeStyle = "#FFF";
            ctx.lineWidth = 1;

            for (let n = 0; n < size; n++) {

                // central node
                let mid = path[n].getPosition();
                let text = (n + 1).toString();

                ctx.fillStyle = "#5AF";
                ctx.beginPath();
                ctx.ellipse(mid.x(), mid.y(), 15, 15, 0, 2 * Math.PI, 0);
                ctx.fill();
                ctx.strokeText(text, mid.x() - 4, mid.y() + 5);

                // left extent
                let left = leftSide[n].getPosition();

                ctx.fillStyle = "#0A0";
                ctx.beginPath();
                ctx.ellipse(left.x(), left.y(), 5, 5, 0, 2 * Math.PI, 0);
                ctx.fill();

                // right extent
                let right = rightSide[n].getPosition();

                ctx.fillStyle = "#C70";
                ctx.beginPath();
                ctx.ellipse(right.x(), right.y(), 5, 5, 0, 2 * Math.PI, 0);
                ctx.fill();
            }
        }
    }

    // clears the canvas
    clearCanvas() {
        let canvas = this.#canvas;
        let ctx = canvas.getContext("2d");
        let offset = this.#offset;

        ctx.clearRect(-offset.x(), -offset.y(), canvas.width, canvas.height);
    }
}
