// manages instances of TrackNode objects
// * TrackNodes are points representing a track path

import Vector2 from "../../geometry/vector2.js";
import PathNode from "../../geometry/path-node.js";
import Validator from "../../../utilities/validator.js";


export default class TrackNode extends PathNode {
    _width;         // number
    _checkpoint;    // boolean

    constructor(position, width = 50, checkpoint = false) {
        super(position);

        this.setWidth(width);
        this.setCheckpoint(checkpoint);
    }


    // getters / setters
    getWidth() { return this._width; }
    setWidth(width) { 
        Validator.isPrimitive(width, "number");
        this._width = width;
    } 

    isCheckpoint() { return this._checkpoint; }
    setCheckpoint(checkpoint) {
        Validator.isPrimitive(checkpoint, "boolean");
        this._checkpoint = checkpoint;
    }


    // serialisation
    toObject() {
        return {
            position: this._position.toObject(),
            width: this._width,
            checkpoint: this._checkpoint
        };
    }

    static toInstance(object) {
        let node = new TrackNode();

        node._position = Vector2.toInstance(object.position);
        node._width = object.width;
        node._checkpoint = object.checkpoint;

        return node;
    }

    toJson(spaces) {
        return JSON.stringify(this.toObject(), null, spaces);
    }
}