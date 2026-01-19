// manages instances of Material objects
// * materials are polygons that apply special effects to race cars
//     which drive over them during a race

import PathNode from "../../geometry/path-node.js";
import Polygon from "../../geometry/polygon.js";


export default class Material extends Polygon {
    _type;

    constructor(points = [], type) {
        super(points);

        this._type = type;
    }


    // methods
    getType() { return this._type; }
    setType(type) { this._type = type; }


    // serialisation
    toObject() {
        return {
            points: this._points?.map(p => p.toObject()) ?? [],
            type: this._type
        };
    }

    static toInstance(object) {
        let material = new Material();

        material._points = object.points.map(p => PathNode.toInstance(p));
        material._type = object.type;

        return material;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}