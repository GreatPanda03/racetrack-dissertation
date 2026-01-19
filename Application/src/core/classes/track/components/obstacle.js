// manages instances of Obstacle objects
// * an Obstacle is a Polygon which causes players to crash when driven into

import PathNode from "../../geometry/path-node.js";
import Polygon from "../../geometry/polygon.js";


export default class Obstacle extends Polygon {
    constructor(points = []) {
        super(points);
    }


    // serialisation
    toObject() {
        return {
            points: this._points?.map(p => p.toObject()) ?? [],
        };
    }

    static toInstance(object) {
        let obstacle = new Obstacle();

        obstacle._points = object.points.map(p => PathNode.toInstance(p));

        return obstacle;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}