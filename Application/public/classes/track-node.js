// manages instances of TrackNode objects
// * TrackNodes are points representing a track path


// [[ Imports ]] //
import Vector2 from "./vector2.js";



// [[ Main Class ]] //
export default class TrackNode {
    #position;      // Vector2
    #width;         // number
    #checkpoint;    // boolean

    constructor(position, width, checkpoint) {
        position = position ?? new Vector2();
        width = width ?? 50;
        checkpoint = checkpoint ?? false;

        if ( !(position instanceof Vector2) ) {
            throw new Error(`[TrackNode] "${position}" is not a valid position`);
        }

        if (typeof width !== "number" || Number.isNaN(width)) {
            throw new Error(`[TrackNode] "${width}" is not a number`);
        }

        if (typeof checkpoint !== "boolean") {
            throw new Error(`[TrackNode] "${checkpoint}" is not a boolean`);
        }

        this.#position = position;
        this.#width = width;
        this.#checkpoint = checkpoint;
    }

    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { this.#position = position; }

    getWidth() { return this.#width; }
    setWidth(width) { this.#width = width; } 

    isCheckpoint() { return this.#checkpoint; }
    setCheckpoint(checkpoint) { this.#checkpoint = checkpoint; }

    // serialisation
    toObject() {
        return {
            position: this.#position.toObject(),
            width: this.#width,
            checkpoint: this.#checkpoint
        };
    }

    static toNode(object) {
        let node = new TrackNode();

        node.#position = Vector2.toVector(object.position);
        node.#width = object.width;
        node.#checkpoint = object.checkpoint;

        return node;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}