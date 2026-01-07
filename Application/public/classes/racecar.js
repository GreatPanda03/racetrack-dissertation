// class to manage RaceCar instances


// [[ Imports ]] //
import Vector2 from "./vector2.js";



// [[ Main Class ]] //
export default class RaceCar {
    #position;  // GRID units (NOT pixels)
    #velocity;  // GRID units (NOT pixels)
    #style;

    constructor() {
        this.#position = new Vector2();
        this.#velocity = new Vector2();
        this.style = null;
    }

    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { this.#position = position; }

    getVelocity() { return this.#velocity; }
    setVelocity(velocity) { this.#velocity = velocity; }

    getStyle() { return this.#style; }
    setStyle(style) { this.#style = style; }

    // methods
    accelerate(speedup) {
        if ( !(speedup instanceof Vector2) ) {
            throw new Error(`[RaceCar] "${speedup}" is not a valid Vector2`);
        }

        this.#velocity = this.#velocity.add(speedup);
    }

    move() {
        this.#position = this.#position.add(this.#velocity);
    }
}