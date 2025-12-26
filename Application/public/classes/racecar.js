// class to manage RaceCar instances

import Vector2 from "./vector2.js";

export default class RaceCar {
    #position;  // grid units
    #velocity;  // grid units
    #style;

    constructor() {
        this.#position = new Vector2()
        this.#velocity = new Vector2()
        this.style = null
    }

    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { this.#position = position; }

    getVelocity() { return this.#velocity; }
    setVelocity(velocity) { this.#velocity = velocity }

    getStyle() { return this.#style; }
    setStyle(style) { this.#style = style; }

    // methods
    accelerate(speedup) {
        this.#velocity = this.#velocity.add(speedup);
    }

    move() {
        this.#position = this.#position.add(this.#velocity);
    }
}