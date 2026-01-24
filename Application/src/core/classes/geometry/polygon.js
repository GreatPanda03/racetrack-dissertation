// manages instances of Polygon objects
// * Polygons consist of Vector2 points which define a shape

import PathNode from "./path-node.js";


export default class Polygon {
    _points;    // Node[]

    constructor(points) {
        if (points) {
            if (points.some( (e) => !(e instanceof PathNode) )) {
                throw new Error("[Polygon] Invalid element found in nodes");
            }
        }

        this._points = points ?? [];
    }


    // getters / setters
    getPoints() { return this._points; }


    // methods
    addPoint(point) {
        let points = this._points;

        if ( !(point instanceof PathNode) ) {
            throw new Error(`[Polygon] "${point} is not a PathNode"`);
        }

        points.push(point);
    }

    removePoint(point) {
        let points = this._points;
        let index = points.indexOf(point);

        if (index < 0) {
            throw new Error(`[Polygon] "${point}" is not a PathNode to remove`);
        }

        points.splice(index, 1);
    }

    getEdges() {
        let edges = [];
        let points = this.getPoints();

        for (let p = 0; p < points.length - 1; p++) {
            let p1 = points[p].getPosition();
            let p2 = points[p + 1].getPosition();

            edges.push([p1, p2]);
        }

        let p1 = points[points.length - 1].getPosition();
        let p2 = points[0].getPosition();
        edges.push([p1, p2]);

        return edges;
    }


    // serialisation
    toObject() {
        return {
            points: this._points?.map(p => p.toObject()) ?? [],
        };
    }

    static toInstance(object) {
        let polygon = new Polygon();

        polygon._points = object.points.map(p => PathNode.toInstance(p));

        return polygon;
    }

    toJson(spaces) {
        return JSON.stringify(this.toObject(), null, spaces);
    }
}