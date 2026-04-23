// class to manage RaceCar instances

import Vector2 from "../geometry/vector2.js";
import PLAYER_TYPE from "../../enums/player-type.js";
import RACECAR_INFO from "../../enums/racecar-info.js";
import Validator from "../../utilities/validator.js";


export default class RaceCar {
    // ALL positional values in GRID units (NOT pixels)
    #playerId;
    #position;
    #velocity;
    #maxSpeed;
    #maxAcceleration;
    #playerType;
    #carType;
    #colour;

    constructor(
        position = new Vector2(),
        velocity = new Vector2(),
        maxSpeed = new Vector2(10, 10),
        maxAcceleration = new Vector2(1, 1),
        colour = "#aa0000"
    ) {
        this.setPosition(position);
        this.setVelocity(velocity);
        this.setMaxSpeed(maxSpeed);
        this.setMaxAcceleration(maxAcceleration);
        this.setCarType("The Race Car");
        this.setColour(colour);
    }


    // getters / setters
    getPlayerId() { return this.#playerId; }
    setPlayerId(id) {
        Validator.isPrimitive(id, "string");
        this.#playerId = id;
    }

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

    getPlayerType() { return this.#playerType; }
    setPlayerType(playerType) {
        Validator.valuePresence(PLAYER_TYPE, playerType);
        this.#playerType = playerType;
    }

    getCarType() { return this.#carType; }
    setCarType(type) {
        Validator.keyPresence(RACECAR_INFO, type);

        this.#carType = type;

        let info = RACECAR_INFO[type];
        this.setMaxSpeed(info.MaxSpeed);
        this.setMaxAcceleration(info.MaxAcceleration);
    }

    getColour() { return this.#colour; }
    setColour(colour) {
        Validator.isPrimitive(colour, "string");
        this.#colour = colour;
    }

    
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


    // serialisation
    toObject() {
        return {
            playerId: this.#playerId,
            position: this.#position.toObject(),
            velocity: this.#velocity.toObject(),
            maxSpeed: this.#maxSpeed.toObject(),
            maxAcceleration: this.#maxAcceleration.toObject(),
            playerType: this.#playerType,
            carType: this.#carType,
            colour: this.#colour,
        }
    }

    static toInstance(object) {
        let racecar = new RaceCar();

        racecar.#playerId = object.playerId;
        racecar.#position = Vector2.toInstance(object.position);
        racecar.#velocity = Vector2.toInstance(object.velocity);
        racecar.#maxSpeed = Vector2.toInstance(object.maxSpeed);
        racecar.#maxAcceleration = Vector2.toInstance(object.maxAcceleration);
        racecar.#playerType = object.playerType;
        racecar.#carType = object.carType;
        racecar.#colour = object.colour;

        return racecar;
    }

    toJSON() {
        return this.toObject();
    }
}