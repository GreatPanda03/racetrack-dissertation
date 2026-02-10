// manages instances of TrackRenderer objects
// * a TrackRenderer renders a given track to a given canvas

import Vector2 from "../geometry/vector2.js";
import TrackForm from "../track/track-form.js";
import Track from "../track/track.js";
import CanvasRenderer from "../rendering/canvas-renderer.js";
import MATERIAL_INFO from "../../enums/material-info.js";
import SplineUtil from "../../utilities/spline-util.js";
import Validator from "../../utilities/validator.js";


export default class TrackRenderer extends CanvasRenderer {
    _track;
    _trackForm;     // TrackForm
    _visibility;    // {string: bool}
    _spacing;       // int (pixels, for grid lines)

    constructor(track, canvas, spacing = 10) {
        super(canvas);
        
        this._visibility = {
            nodes: true,
            wires: true,
            path: true,
            materials: true,
            obstacles: true,
            decorations: true,
            grid: true
        }
        
        this.setTrack(track); // also sets TrackForm
        this.setSpacing(spacing);
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
        Validator.isInstance(track, Track);
        this._track = track;
        this._trackForm = new TrackForm(track);
        this.redrawTrack();
    }

    getVisibility(type) {
        Validator.keyPresence(this._visibility, type);
        return this._visibility[type];
    }

    setVisibility(type, state) {
        Validator.keyPresence(this._visibility, type);
        this._visibility[type] = state;
    }

    getSpacing() { return this._spacing; }
    setSpacing(spacing) {
        Validator.isPrimitive(spacing, "number");
        this._spacing = spacing;
    }


    // methods
    redrawTrack() {
        this.clearCanvas();

        this._trackForm.calculateNodeSpans(this._track);
        this._trackForm.calculateBoundaries(this._track);

        let visibility = this._visibility;

        let visuals = [ // corresponds to draw order
            { Method: this.renderPath,          Key: "path" },
            { Method: this.renderDecorations,   Key: "decorations" },
            { Method: this.renderMaterials,     Key: "materials" },
            { Method: this.renderObstacles,     Key: "obstacles" },
            { Method: this.renderPathOutline,   Key: "path" },
            { Method: this.renderCheckpoints,   Key: "path" },
            { Method: this.renderWires,         Key: "wires" },
            { Method: this.renderNodes,         Key: "nodes" },
            { Method: this.renderDirection,     Key: "path" },
            { Method: this.renderGridLines,     Key: "grid" }
        ]

        for (let entry of visuals) {
            Validator.keyPresence(visibility, entry.Key);
            if (visibility[entry.Key]) entry.Method.call(this);
        }
    }

    renderNodes() {
        let track = this._track;
        let form = this._trackForm;
        let size = track.getSize();

        let path = track.getPath();

        for (let n = 0; n < size; n++) {
            let span = form.getNodeSpan(n);

            let left = span.start;
            let mid = path[n].getPosition();
            let right = span.end;

            this.drawCircle(left, 5, "#C70");
            this.drawCircle(mid, 15, path[n].isCheckpoint() ? "#A5F" : "#5AF");
            this.drawCircle(right, 5, "#0A0");
            this.drawText(`${n + 1}`, mid, 16);
        }
    }

    renderWires() {
        let track = this._track;
        let size = track.getSize();

        if (size < 2) return;

        let form = this._trackForm;
        let looped = track.isLooped();
        let path = track.getPath();

        let nmax = looped ? size : size - 1;

        for (let n = 0; n < nmax; n++) {
            let span1 = form.getNodeSpan(n);
            let span2 = form.getNodeSpan((n + 1) % size);

            let mid1 = path[n].getPosition();
            let mid2 = path[(n + 1) % size].getPosition();                
            
            let left1 = span1.start, left2 = span2.start;
            let right1 = span1.end, right2 = span2.end;

            this.drawLine(left1, left2, 2, "#999");    // left edge
            this.drawLine(mid1, mid2, 5, "#999");      // central edge
            this.drawLine(right1, right2, 2, "#999");  // right edge
            this.drawLine(left1, right1, 2, "#999");   // span
        }

        if (!looped) {
            let span = form.getNodeSpan(nmax);
            let left = span.start, right = span.end;
            this.drawLine(left, right, 2, "#999");
        }
    }

    renderPathOutline() {
        let track = this._track;
        let size = track.getSize();

        if (size < 2) return;

        let form = this._trackForm;
        let [left, right] = form.getSplitNodeSpans();
        let looped = track.isLooped();

        let res = 0.1;
        let tmax = looped ? size : size - 1;

        let ctx = this._ctx;
        ctx.strokeStyle = "#555";
        
        // left track edge
        // * see "renderPath" for why an integer step is used
        ctx.beginPath();

        for (let s = 0; s < Math.round((1 / res) * tmax); s += 1) {
            let t = s * res;

            let left1 = SplineUtil.getPointAtT(left, t, looped);
            let left2 = SplineUtil.getPointAtT(left, t + res, looped);

            ctx.lineTo(left1.x, left1.y);
            ctx.lineTo(left2.x, left2.y);
        }

        ctx.stroke();
        ctx.closePath();

        // right track edge
        ctx.beginPath();

        for (let s = 0; s < Math.round((1 / res) * tmax); s += 1) {
            let t = s * res;

            let right1 = SplineUtil.getPointAtT(right, t, looped);
            let right2 = SplineUtil.getPointAtT(right, t + res, looped);

            ctx.lineTo(right1.x, right1.y);
            ctx.lineTo(right2.x, right2.y);
        }
        
        ctx.stroke();
        ctx.closePath();
    }

    renderPath() {
        // treated as a polygon with a hole
        let track = this._track;
        let size = track.getSize();
        
        if (size < 2) return;

        let form = this._trackForm;
        let [left, right] = form.getSplitNodeSpans();
        let looped = track.isLooped();

        let res = 0.1;
        let tmax = looped ? size : size - 1;

        let ctx = this._ctx;
        ctx.fillStyle = "#CCC";
        ctx.beginPath();
        
        // preparing the first stroke into the left side
        if (looped) { // starting at on the left of Node 1
            let start = SplineUtil.getPointAtT(left, 0, looped);
            ctx.moveTo(start.x, start.y);

        } else { // the "closing line" of the start; the span of Node 1
            let startR = SplineUtil.getPointAtT(right, 0, looped);
            let startL = SplineUtil.getPointAtT(left, 0, looped);
            
            ctx.moveTo(startR.x, startR.y);
            ctx.lineTo(startL.x, startL.y);
        }

        // left track edge (drawn "clockwise")
        // * originally used "t" directly, but that sometimes leaves
        //     "artefacts" at track end due to floating point errors, so
        //     uses an integer step instead (as a workaround)
        for (let s = 0; s < Math.round((1 / res) * tmax); s += 1) {
            let t = s * res;

            let left1 = SplineUtil.getPointAtT(left, t, looped);
            let left2 = SplineUtil.getPointAtT(left, t + res, looped);

            ctx.lineTo(left1.x, left1.y);
            ctx.lineTo(left2.x, left2.y);
        }
        
        // preparing the first stroke into the right side
        if (looped) { // moving over to the right of Node 1
            let start = SplineUtil.getPointAtT(right, tmax, looped);
            ctx.moveTo(start.x, start.y);

        } else { // the "closing line" of the end; the span of Node N
            let endR = SplineUtil.getPointAtT(right, tmax, looped);
            ctx.lineTo(endR.x, endR.y);
        }
        
        // right track edge (drawn "anticlockwise" to create the hole)
        // * source: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
        // * okay to use t as part of loop here
        for (let t = tmax; t >= res; t -= res) {
            let right1 = SplineUtil.getPointAtT(right, t, looped);
            let right2 = SplineUtil.getPointAtT(right, t - res, looped);

            ctx.lineTo(right1.x, right1.y);
            ctx.lineTo(right2.x, right2.y);
        }

        ctx.fill() // fill in based on all points
        ctx.closePath();
    }

    renderMaterials() {
        let track = this._track;
        let materials = track.getMaterials();

        for (let material of materials) {
            let colour = MATERIAL_INFO[material.getType()].Colour;
            this.drawPolygon(material, colour, this.getVisibility("nodes"));
        }
    }

    renderObstacles() {
        let track = this._track;
        let obstacles = track.getObstacles();

        for (let obstacle of obstacles) {
            let colour = "#F90";
            this.drawPolygon(obstacle, colour, this.getVisibility("nodes"));
        }
    }

    renderDecorations() {
        let track = this._track;
        let decorations = track.getDecorations();

        for (let decoration of decorations) {
            let colour = decoration.getColour();
            this.drawPolygon(decoration, colour, this.getVisibility("nodes"));
        }
    }

    renderCheckpoints() {
        let track = this._track;
        let size = track.getSize();

        if (size < 2) return;

        let path = track.getPath();
        let form = this._trackForm;
        let [left, right] = form.getSplitNodeSpans();
        let looped = track.isLooped();

        // start line (& finish line, if looped)
        this.drawLine(left[0], right[0], 10, "#000");

        if (!looped) {
            this.drawLine(left[size - 1], right[size - 1], 10, "#000");
        }

        // every other checkpoint
        for (let n = 1; n < size; n++) {
            if (path[n].isCheckpoint()) {
                this.drawLine(left[n], right[n], 10, "#FC5");
            }
        }
    }

    renderDirection() {
        let track = this._track;
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
        let correction = 1 / this._scale;

        let gridR = Math.floor(canvas.height / spacing * correction);
        let gridC = Math.floor(canvas.width / spacing * correction);

        for (let r = 1; r < gridR; r += 1) {
            let start = new Vector2(0, r * spacing);
            let end = new Vector2(canvas.width * correction, r * spacing);
            this.drawLine(start, end, 1, "#0005");
        }

        for (let c = 1; c < gridC; c += 1) {
            let start = new Vector2(c * spacing, 0);
            let end = new Vector2(c * spacing, canvas.height * correction);
            this.drawLine(start, end, 1, "#0005");
        }
    }
}
