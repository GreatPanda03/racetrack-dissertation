// manages instances of TrackRenderer objects
// * a TrackRenderer renders a given track to a given canvas

import Vector2 from "../geometry/vector2.js";
import TrackForm from "../track/track-form.js";
import Track from "../track/track.js";
import CanvasRenderer from "../rendering/canvas-renderer.js";
import MATERIAL_INFO from "../../enums/material-info.js";
import SplineUtil from "../../utilities/spline-util.js";


export default class TrackRenderer extends CanvasRenderer {
    _trackForm;     // TrackForm
    _visibility;    // {string: bool}
    _spacing;       // int (pixels, for grid lines)

    constructor(track, canvas, spacing = 25) {
        if (track == null || !(track instanceof Track)) {
            throw new Error(`[TrackRenderer] "${track}" is not a valid Track`);
        }

        if (canvas == null || canvas.tagName != "CANVAS") {
            throw new Error(`[TrackRenderer] "${canvas}" is not a valid Canvas`)
        }

        super(canvas);

        this._ctx = canvas.getContext("2d");
        this._trackForm = new TrackForm(track);

        this._visibility = {
            nodes: true,
            wires: true,
            path: true,
            materials: true,
            obstacles: true,
            decorations: true
        }

        this._spacing = spacing;
    }


    // getters / setters
    getCanvas() { return this._canvas; }
    
    setCanvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this.redrawTrack();
    }

    getTrackForm() { return this._trackForm; }

    setTrack(track) {
        this._trackForm = new TrackForm(track);
        this.redrawTrack();
    }

    getVisibility(type) {
        this.#validateVisibilityKey(type);
        return this._visibility[type];
    }

    setVisibility(type, state) {
        this.#validateVisibilityKey(type);
        this._visibility[type] = state;
    }

    getOffset() { return this._offset; }
    setOffset(offset) { this._offset = offset; }


    // methods
    redrawTrack() {
        this.clearCanvas();

        let form = this._trackForm;
        form.updateNodeExtents();

        let visibility = this._visibility;

        let visuals = [
            { Method: this.renderPath,          Key: "path" },
            { Method: this.renderDecorations,   Key: "decorations" },
            { Method: this.renderMaterials,     Key: "materials" },
            { Method: this.renderObstacles,     Key: "obstacles" },
            { Method: this.renderPathOutline,   Key: "path" },
            { Method: this.renderCheckpoints,   Key: "path" },
            { Method: this.renderWires,         Key: "wires" },
            { Method: this.renderNodes,         Key: "nodes" },
            { Method: this.renderDirection,     Key: "path" }
        ]

        for (let entry of visuals) {
            this.#validateVisibilityKey(entry.Key);
            if (visibility[entry.Key]) entry.Method.call(this);
        }
        
        this.renderGridLines();
    }

    renderNodes() {
        let track = this._trackForm.getTrack();
        let size = track.getSize();

        let path = track.getPath();
        let leftSide = this._trackForm.getLeftSide();
        let rightSide = this._trackForm.getRightSide();

        for (let n = 0; n < size; n++) {
            let left = leftSide[n].getPosition();
            let mid = path[n].getPosition();
            let right = rightSide[n].getPosition();

            this.drawCircle(left, 5, "#C70");
            this.drawCircle(mid, 15, path[n].isCheckpoint() ? "#A5F" : "#5AF");
            this.drawCircle(right, 5, "#0A0");
            this.drawText(`${n + 1}`, mid, 16);
        }
    }

    renderWires() {
        let track = this._trackForm.getTrack();
        let size = track.getSize();

        if (size < 2) return;

        let looped = track.isLooped();
        let path = track.getPath();
        let leftSide = this._trackForm.getLeftSide();
        let rightSide = this._trackForm.getRightSide();

        let nmax = looped ? size : size - 1;

        for (let n = 0; n < nmax; n++) {
            let mid1 = path[n].getPosition();
            let mid2 = path[(n + 1) % size].getPosition();                
            
            let left1 = leftSide[n].getPosition();
            let left2 = leftSide[(n + 1) % size].getPosition();
            
            let right1 = rightSide[n].getPosition();
            let right2 = rightSide[(n + 1) % size].getPosition();

            this.drawLine(left1, left2, 2, "#999");    // left edge
            this.drawLine(mid1, mid2, 5, "#999");      // central edge
            this.drawLine(right1, right2, 2, "#999");  // right edge
            this.drawLine(left1, right1, 2, "#999");   // span
        }
    }

    renderPathOutline() {
        let track = this._trackForm.getTrack();
        let size = track.getSize();

        if (size < 2) return;

        let looped = track.isLooped();
        let leftSide = this._trackForm.getLeftSide();
        let rightSide = this._trackForm.getRightSide();

        let res = 0.1;
        let tmax = looped ? size : size - 1;

        let ctx = this._ctx;
        ctx.strokeStyle = "#555";
        
        // left track edge
        ctx.beginPath();

        for (let t = 0; t < tmax; t += res) {
            let left1 = SplineUtil.getPointAtT(leftSide, t, looped);
            let left2 = SplineUtil.getPointAtT(leftSide, t + res, looped);

            ctx.lineTo(left1.x(), left1.y());
            ctx.lineTo(left2.x(), left2.y());
        }

        ctx.stroke();
        ctx.closePath();

        // right track edge
        ctx.beginPath();

        for (let t = 0; t < tmax; t += res) {
            let right1 = SplineUtil.getPointAtT(rightSide, t, looped);
            let right2 = SplineUtil.getPointAtT(rightSide, t + res, looped);

            ctx.lineTo(right1.x(), right1.y());
            ctx.lineTo(right2.x(), right2.y());
        }
        
        ctx.stroke();
        ctx.closePath();
    }

    renderPath() {
        // treated as a polygon with a hole
        let track = this._trackForm.getTrack();
        let size = track.getSize();
        
        if (size < 2) return;

        let looped = track.isLooped();
        let leftSide = this._trackForm.getLeftSide();
        let rightSide = this._trackForm.getRightSide();

        let res = 0.1;
        let tmax = looped ? size : size - 1;

        let ctx = this._ctx;
        ctx.fillStyle = "#CCC";
        ctx.beginPath();
        
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
        ctx.closePath();
    }

    renderMaterials() {
        let track = this._trackForm.getTrack();
        let materials = track.getMaterials();

        for (let material of materials) {
            let colour = MATERIAL_INFO[material.getType()].Colour;
            this.drawPolygon(material, colour, this.getVisibility("nodes"));
        }
    }

    renderObstacles() {
        let track = this._trackForm.getTrack();
        let obstacles = track.getObstacles();

        for (let obstacle of obstacles) {
            let colour = "#F90";
            this.drawPolygon(obstacle, colour, this.getVisibility("nodes"));
        }
    }

    renderDecorations() {
        let track = this._trackForm.getTrack();
        let decorations = track.getDecorations();

        for (let decoration of decorations) {
            let colour = decoration.getColour();
            this.drawPolygon(decoration, colour, this.getVisibility("nodes"));
        }
    }

    renderCheckpoints() {
        let track = this._trackForm.getTrack();
        let size = track.getSize();

        if (size < 2) return;

        let looped = track.isLooped();
        let path = track.getPath();
        let leftSide = this._trackForm.getLeftSide();
        let rightSide = this._trackForm.getRightSide();

        // start line (& finish line, if looped)
        let left = leftSide[0].getPosition();
        let right = rightSide[0].getPosition()
        this.drawLine(left, right, 10, "#000");

        if (!looped) {
            let left = leftSide[size - 1].getPosition();
            let right = rightSide[size - 1].getPosition()
            this.drawLine(left, right, 10, "#000");
        }

        // every other checkpoint
        for (let n = 1; n < size; n++) {
            if (path[n].isCheckpoint()) {
                let left = leftSide[n].getPosition();
                let right = rightSide[n].getPosition();
                this.drawLine(left, right, 10, "#FC5");
            }
        }
    }

    renderDirection() {
        let track = this._trackForm.getTrack();
        let size = track.getSize();

        if (size < 2) return;

        let path = track.getPath();

        let start = path[0].getPosition();
        let end = path[1].getPosition();
        let unit = end.sub(start).unit();
        let pos = start.add(unit.scale(50));

        this.drawCircle(pos, 5, "#5AF");
    }

    renderGridLines() {
        let canvas = this._canvas;
        let spacing = this._spacing;

        let gridR = Math.floor(canvas.height / spacing)
        let gridC = Math.floor(canvas.width / spacing)

        for (let r = 1; r < gridR; r += 1) {
            let start = new Vector2(0, r * spacing);
            let end = new Vector2(canvas.width, r * spacing);
            this.drawLine(start, end, 1, "#0005");
        }

        for (let c = 1; c < gridC; c += 1) {
            let start = new Vector2(c * spacing, 0);
            let end = new Vector2(c * spacing, canvas.height);
            this.drawLine(start, end, 1, "#0005");
        }
    }


    // validation
    #validateVisibilityKey(key) {
        if ( !(key in this._visibility) ) {
            throw new Error(`[TrackRenderer] "${key}" is not a recognised visual type`);
        }
    }
}
