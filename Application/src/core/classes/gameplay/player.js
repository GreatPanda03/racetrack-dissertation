// class to manage Player instances
// * players can be literal people or otherwise

import RaceCar from "./racecar.js";
import RACER_TYPE from "../../enums/racer-type.js";
import Validator from "../../utilities/validator.js";


export default class Player {
    #id;
    #name;
    #playerType;
    #racecar;

    constructor(playerId, name, playerType) {
        Validator.isPrimitive(playerId, "string");
        Validator.valuePresence(RACER_TYPE, playerType);

        this.#id = id;
        this.#name = name;
        this.#playerType = playerType;
    }


    // getters / setters
    getId() { return this.#id; }
    getName() { return this.#name; }
    getPlayerType() { return this.#playerType; }
    
    getRacecar() { return this.#racecar; }
    setRacecar(racecar) {
        Validator.isInstance(racecar, RaceCar);
        this.#racecar = racecar
    }
}

