// manages instances of Node objects
// * nodes are points representing a track path

import Vector2 from "./vector2.js";

export default class Node {
    #position;      // Vector2
    #width;         // number
    #checkpoint;    // boolean

    constructor(position, width, checkpoint) {
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
        let node = new Node();

        node.#position = Vector2.toVector(object.position);
        node.#width = object.width;
        node.#checkpoint = object.checkpoint;

        return node;
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}