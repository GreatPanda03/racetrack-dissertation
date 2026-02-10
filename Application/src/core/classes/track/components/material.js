// manages instances of Material objects
// * materials are polygons that apply special effects to race cars
//     which drive over them during a race

import PathNode from "../../geometry/path-node.js";
import Polygon from "../../geometry/polygon.js";
import MATERIAL_INFO from "../../../enums/material-info.js";
import Validator from "../../../utilities/validator.js";


export default class Material extends Polygon {
    _type;

    constructor(points = [], type = MATERIAL_INFO.Curb.Name) {
        super(points);
        
        this.setType(type);
    }


    // methods
    getType() { return this._type; }
    setType(type) { 
        Validator.keyPresence(MATERIAL_INFO, type);
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
        let material = new Material();

        material._points = object.points.map(p => PathNode.toInstance(p));
        material.setType(object.type)

        return material;
    }

    toJson(spaces) {
        return JSON.stringify(this.toObject(), null, spaces);
    }
}