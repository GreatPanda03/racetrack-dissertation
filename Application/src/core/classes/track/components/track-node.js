// manages instances of TrackNode objects
// * TrackNodes are points representing a track path


// [[ Imports ]] //
import Vector2 from "../../geometry/vector2.js";
import PathNode from "../../geometry/path-node.js";



// [[ Main Class ]] //
export default class TrackNode extends PathNode {
    _width;         // number
    _checkpoint;    // boolean

    constructor(position, width, checkpoint) {
        super(position);

        width = width ?? 50;
        checkpoint = checkpoint ?? false;

        if (typeof width !== "number" || Number.isNaN(width)) {
            throw new Error(`[TrackNode] "${width}" is not a number`);
        }

        if (typeof checkpoint !== "boolean") {
            throw new Error(`[TrackNode] "${checkpoint}" is not a boolean`);
        }

        this._width = width;
        this._checkpoint = checkpoint;
    }


    // getters / setters
    getWidth() { return this._width; }
    setWidth(width) { this._width = width; } 

    isCheckpoint() { return this._checkpoint; }
    setCheckpoint(checkpoint) { this._checkpoint = checkpoint; }


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

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}