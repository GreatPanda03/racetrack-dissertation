// manages instances of Decoration objects
// * a Decoration is a Polygon which is solely ornamental with no extra effects


// [[ Imports ]] //
import PathNode from "../../geometry/path-node.js";
import Polygon from "../../geometry/polygon.js";



// [[ Main Class ]] //
export default class Decoration extends Polygon {
    _colour;

    constructor(points = [], colour = "#cc77ff") {
        super(points);

        this._colour = colour;
    }


    // methods
    getColour() { return this._colour };
    setColour(colour) { this._colour = colour };


    // serialisation
    toObject() {
        return {
            points: this._points?.map(p => p.toObject()) ?? [],
        };
    }

    static toInstance(object) {
        let decoration = new Decoration();

        decoration._points = object.points.map(p => PathNode.toInstance(p));

        return decoration;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}