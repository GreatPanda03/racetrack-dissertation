// nodes are points representing a track path

class Node {
    #position; #width; #checkpoint;

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