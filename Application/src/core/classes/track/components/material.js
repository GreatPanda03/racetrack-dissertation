// manages instances of Material objects
// * materials are polygons that apply special effects to race cars
//     which drive over them during a race


// [[ Imports ]] //
import Polygon from "../../geometry/polygon.js";


// [[ Main Class ]] //
export default class Material extends Polygon {
    _type;

    constructor(points = [], type) {
        super(points);

        this._type = type;
    }


    // serialisation
    toObject() {
        return {
            points: this._points?.map(p => p.toObject()) ?? [],
            type: this._type
        };
    }

    static toInstance(object) {
        let material = new Polygon();

        material._points = object.points.map(p => Node.toInstance(p));
        material._type = object.type;

        return material;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}