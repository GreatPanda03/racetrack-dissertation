// class to manage Player instances
// * players can be literal people or otherwise

import PLAYER_TYPE from "../../enums/player-type.js";
import Validator from "../../utilities/validator.js";


export default class Player {
    #id;
    #name;
    #playerType;

    constructor(id, name, playerType) {
        Validator.isPrimitive(id, "string");
        Validator.valuePresence(PLAYER_TYPE, playerType);

        let prefix = Object.keys(PLAYER_TYPE).find(
            k => PLAYER_TYPE[k] == playerType);

        let tempName = `${prefix} ${id}`;

        this.#id = id;
        this.#name = tempName;
        this.#playerType = playerType;
    }


    // getters / setters
    getId() { return this.#id; }
    getName() { return this.#name; }
    getPlayerType() { return this.#playerType; }


    // serialisation
    toObject() {
        return {
            id: this.#id,
            name: this.#name,
            playerType: this.#playerType,
        };
    }

    static toInstance(object) {
        let player = new Player(
            object.id, object.name, object.playerType);

        return player;
    }

    toJSON() {
        return this.toObject();
    }
}

