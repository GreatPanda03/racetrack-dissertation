// manages instances of Node objects
// * nodes are points representing a track path

export default class Node {
    #position;      // Vector2
    #width;         // number
    #checkpoint;    // boolean

    constructor(position, width, checkpoint) {
        this.#position = position;
        this.#width = width;
        this.#checkpoint = checkpoint
    }

    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { this.#position = position; }

    getWidth() { return this.#width; }
    setWidth(width) { this.#width = width; } 

    isCheckpoint() { return this.#checkpoint; }
    setCheckpoint(checkpoint) { this.#checkpoint = checkpoint; }
}