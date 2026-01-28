// class to manage RaceCar instances

import Vector2 from "../geometry/vector2.js";


export default class RaceCar {
    #position;  // GRID units (NOT pixels)
    #velocity;  // GRID units (NOT pixels)
    #maxSpeed;  // GRID units (NOT pixels)
    #maxAcceleration;   // GRID units (NOT pixels)
    #style;

    constructor() {
        this.#position = new Vector2();
        this.#velocity = new Vector2();
        this.#maxSpeed = new Vector2(1, 1);
        this.#maxAcceleration = new Vector2(1, 1);
        this.style = null;
    }


    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { this.#position = position; }

    getVelocity() { return this.#velocity; }
    setVelocity(velocity) { this.#velocity = velocity; }

    getMaxSpeed() { return this.#maxSpeed; }
    setMaxSpeed(maxSpeed) { this.#maxSpeed = maxSpeed; }

    getMaxAcceleration() { return this.#maxAcceleration }
    setMaxAcceleration(acceleration) { this.#maxAcceleration = acceleration};

    getStyle() { return this.#style; }
    setStyle(style) { this.#style = style; }

    // methods
    accelerate(speedup) {
        if ( !(speedup instanceof Vector2) ) {
            throw new Error(`[RaceCar] "${speedup}" is not a valid Vector2`);
        }

        this.#velocity = this.#velocity.add(speedup);
        this.#velocity = new Vector2(
            Math.min(Math.max(this.#velocity.x(), -this.#maxSpeed.x()), this.#maxSpeed.x()),
            Math.min(Math.max(this.#velocity.y(), -this.#maxSpeed.y()), this.#maxSpeed.y())
        );
    }

    move() {
        this.#position = this.#position.add(this.#velocity);
    }

    setType(carType) {
        this.#maxSpeed = carType.MaxSpeed;
        this.#maxAcceleration = carType.MaxAcceleration;
    }
}