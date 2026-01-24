// class to manage CanvasRenderer instances
// * a CanvasRenderer is a basic class that has a canvas which can be drawn to

import Vector2 from "../geometry/vector2.js";


export default class CanvasRenderer {
    _canvas;        // HTML canvas element
    _ctx;           // Context (never exposed)
    _offset;        // Vector2
    _scale;         // float

    constructor(canvas) {
        if (canvas == null || canvas.tagName != "CANVAS") {
            throw new Error(`[TrackRenderer] "${canvas}" is not a valid Canvas`)
        }

        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._offset = new Vector2(0, 0);
        this._scale = 1;
    }


    // getters / setters
    getOffset() { return this._offset; }
    setOffset(offset) { this._offset = offset; }

    getScale() { return this._scale; }
    setScale(scale) { 
        this._scale = scale;
        this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._ctx.scale(scale, scale);

        // NOTE: scale is cumulative (multiplicative?),
        //   so must be reset
    }

    
    // methods
    drawLine(p1, p2, width, colour) {
        let ctx = this._ctx;
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x(), p1.y());
        ctx.lineTo(p2.x(), p2.y());
        ctx.stroke();
        ctx.closePath();
    }

    drawCircle(centre, radius, colour, fill = true) {
        let ctx = this._ctx;
        ctx.beginPath();
        ctx.ellipse(centre.x(), centre.y(), radius, radius, 0, 2 * Math.PI, 0);
        
        if (fill) {
            ctx.fillStyle = colour;
            ctx.fill();
        } else {
            ctx.strokeStyle = colour;
            ctx.stroke();
        }

        ctx.closePath();
    }

    drawPolygon(polygon, colour, showPoints = true, fill = true) {
        let ctx = this._ctx;
        ctx.fillStyle = colour;

        // first edges
        ctx.beginPath();
        
        let edges = polygon.getEdges();
        if (edges.length == 0) return;

        let start = edges[0][0];
        ctx.moveTo(start.x(), start.y());

        for (let edge of polygon.getEdges()) {
            let pos = edge[1];
            ctx.lineTo(pos.x(), pos.y());
        }

        if (fill) {
            ctx.fillStyle = colour;
            ctx.fill();
        } else {
            ctx.strokeStyle = colour;
            ctx.stroke();
        }

        ctx.closePath();

        // ... then points on top
        if (showPoints) {
            let points = polygon.getPoints();

            for (let p = 0; p < points.length; p++) {
                let point = points[p];
                let pos = point.getPosition()
                this.drawCircle(pos, 10, colour);
                this.drawText(`${p + 1}`, pos, 10);
            }
        }
    }

    drawText(text, position, size) {
        let ctx = this._ctx;
        ctx.font = `${size}px Segoe UI`;
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        ctx.strokeText(text, position.x(), position.y() + (size * 0.3));
    }

    clearCanvas() {
        let canvas = this._canvas;
        let ctx = this._ctx;
        let offset = this._offset;
        let correction = 1 / this._scale;

        ctx.clearRect(
            -offset.x(), 
            -offset.y(), 
            canvas.width * correction,
            canvas.height * correction
        );
    }
}


