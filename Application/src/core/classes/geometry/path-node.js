// manages instances of Node objects
// * PathNode is a generic point used to form larger paths


// [[ Imports ]] //
import Vector2 from "./vector2.js";



// [[ Main Class ]] //
export default class PathNode {
    _position;      // Vector2

    constructor(position = new Vector2()) {
        if ( !(position instanceof Vector2) ) {
            throw new Error(`[PathNode] "${position}" is not a valid Vector2`);
        }

        this._position = position.round();

    }


    // getters / setters
    getPosition() { return this._position; }
    setPosition(position) { this._position = position.round(); }


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

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}