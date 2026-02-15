// manages instances of Polygon objects
// * Polygons consist of Vector2 points which define a shape

import PathNode from "./path-node.js";
import Validator from "../../utilities/validator.js";


export default class Polygon {
    _points;    // PathNode[]

    constructor(points = []) {
        this.setPoints(points);
    }


    // getters / setters
    getPoints() { return this._points; }
    setPoints(points) {
        Validator.isInstanceList(points, PathNode);
        this._points = points;
    }


    // methods
    addPoint(point) {
        Validator.isInstance(point, PathNode);
        
        let points = this._points;
        points.push(point);
    }

    removePoint(point) {
        let points = this._points;
        let index = Validator.listPresence(points, point);

        points.splice(index, 1);
    }

    getEdges() {
        let points = this.getPoints();
        if (points.length == 0) return [];

        let edges = [];

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