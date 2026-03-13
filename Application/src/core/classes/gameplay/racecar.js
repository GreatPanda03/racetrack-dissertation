// class to manage RaceCar instances

import Vector2 from "../geometry/vector2.js";
import RACECAR_INFO from "../../enums/racecar-info.js";
import RACER_TYPE from "../../enums/racer-type.js";
import Validator from "../../utilities/validator.js";


export default class RaceCar {
    // ALL positional values in GRID units (NOT pixels)
    #position;
    #velocity;
    #maxSpeed;
    #maxAcceleration;
    #carType;
    #racerType;
    #colour;
    #style;

    constructor(
        position = new Vector2(),
        velocity = new Vector2(),
        maxSpeed = new Vector2(10, 10),
        maxAcceleration = new Vector2(1, 1),
        colour = "#A00"
    ) {
        this.setPosition(position);
        this.setVelocity(velocity);
        this.setMaxSpeed(maxSpeed);
        this.setMaxAcceleration(maxAcceleration);
        this.setCarType("The Race Car");
        this.setRacerType(RACER_TYPE.Robot);
        this.setColour(colour);
        this.style = null;
    }


    // getters / setters
    getPosition() { return this.#position; }
    setPosition(position) { 
        Validator.isInstance(position, Vector2);
        this.#position = position;
    }

    getVelocity() { return this.#velocity; }
    setVelocity(velocity) {
        Validator.isInstance(velocity, Vector2);
        this.#velocity = velocity;
    }

    getMaxSpeed() { return this.#maxSpeed; }
    setMaxSpeed(maxSpeed) {
        Validator.isInstance(maxSpeed, Vector2);
        this.#maxSpeed = maxSpeed;
    }

    getMaxAcceleration() { return this.#maxAcceleration }
    setMaxAcceleration(acceleration) {
        Validator.isInstance(acceleration, Vector2);
        this.#maxAcceleration = acceleration;
    };

    getCarType() { return this.#carType; }
    setCarType(type) {
        Validator.keyPresence(RACECAR_INFO, type);

        this.#carType = type;

        let info = RACECAR_INFO[type];
        this.setMaxSpeed(info.MaxSpeed);
        this.setMaxAcceleration(info.MaxAcceleration);
    }

    getRacerType() { return this.#racerType; }
    setRacerType(racerType) {
        Validator.valuePresence(RACER_TYPE, racerType);
        this.#racerType = racerType;
    }

    getColour() { return this.#colour; }
    setColour(colour) {
        Validator.isPrimitive(colour, "string");
        this.#colour = colour;
    }

    getStyle() { return this.#style; }
    setStyle(style) { this.#style = style; }

    
    // methods
    getClampedSpeedup(speedup) {
        Validator.isInstance(speedup, Vector2);

        let aMax = this.#maxAcceleration;
        let vMax = this.#maxSpeed;

        return this.#velocity // limit acc. and vel.
            .add(speedup.clamp(-aMax.x, aMax.x, -aMax.y, aMax.y))
            .clamp(-vMax.x, vMax.x, -vMax.y, vMax.y);
    }

    accelerate(speedup) {
        let newVelocity = this.getClampedSpeedup(speedup);
        this.#velocity = newVelocity;
    }

    move() {
        this.#position = this.#position.add(this.#velocity);
    }
}