// manages instances of Node objects
// * PathNode is a generic point used to form larger paths

import Vector2 from "./vector2.js";
import Validator from "../../utilities/validator.js";


export default class PathNode {
    _position;      // Vector2

    constructor(position = new Vector2()) {
        this.setPosition(position);
    }


    // getters / setters
    getPosition() { return this._position; }
    setPosition(position) {
        Validator.isInstance(position, Vector2);
        this._position = position;
    }


    // serialisation
    toObject() {
        return {
            position: this._position.toObject(),
        };
    }

    static toInstance(object) {
        let node = new PathNode();

        node._position = Vector2.toInstance(object.position);

        return node;
    }

    toJson(spaces) {
        return JSON.stringify(this.toObject(), null, spaces);
    }
}